const { createClient } = require('@supabase/supabase-js');
const url = 'https://ldcanydpownbzqlqfulf.supabase.co';
const key = 'j3hbBDYKd78ivo-Ww_WrPmwXC5';
const supabase = createClient(url, key);

(async () => {
  const { data, error } = await supabase.storage.from('product-images').list();
  console.log('error', error);
  console.log('data', data);
})();
