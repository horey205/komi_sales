
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zygqappdbfwysxfndxps.supabase.co'
const supabaseKey = 'sb_publishable_7Ns5aTfzWpm5x-A2ZBpHaA_2ZXlh-68'

export const supabase = createClient(supabaseUrl, supabaseKey)
