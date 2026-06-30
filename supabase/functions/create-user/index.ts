import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { email, password, nama_lengkap, nip, kode_unit, role, jabatan } = await req.json()

    // Validasi
    if (!email || !password || !nama_lengkap || !kode_unit || !role) {
      return new Response(JSON.stringify({ success: false, error: 'Field wajib: email, password, nama_lengkap, kode_unit, role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Gunakan service_role untuk admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Verify caller is SUPER_ADMIN (pakai user JWT dari Authorization header)
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      if (authError || !user) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Cek role caller
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'SUPER_ADMIN') {
        return new Response(JSON.stringify({ success: false, error: 'Forbidden: hanya SUPER_ADMIN' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Authorization header required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Buat auth user via admin API
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return new Response(JSON.stringify({ success: false, error: createError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Insert profile
    if (authData?.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          nama_lengkap,
          nip: nip || null,
          kode_unit,
          role,
          jabatan: jabatan || null,
        })

      if (profileError) {
        // Rollback: hapus auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return new Response(JSON.stringify({ success: false, error: profileError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: { id: authData.user.id, email: authData.user.email },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
