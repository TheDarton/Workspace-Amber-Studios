import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DiagnosticResult {
  countries?: { data: unknown; error: unknown };
  months?: { data: unknown; error: unknown };
  settings?: { data: unknown; error: unknown };
  exception?: unknown;
}

export function DiagnosticTest() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log('=== DIAGNOSTIC TEST START ===');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

    try {
      // Test 1: Query countries
      console.log('Test 1: Querying countries...');
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('*');
      console.log('Countries result:', { countries, countriesError });

      // Test 2: Query visible_months
      console.log('Test 2: Querying visible_months...');
      const { data: months, error: monthsError } = await supabase
        .from('visible_months')
        .select('*');
      console.log('Visible months result:', { months, monthsError });

      // Test 3: Query visible_months_settings
      console.log('Test 3: Querying visible_months_settings...');
      const { data: settings, error: settingsError } = await supabase
        .from('visible_months_settings')
        .select('*');
      console.log('Visible months settings result:', { settings, settingsError });

      setResult({
        countries: { data: countries, error: countriesError },
        months: { data: months, error: monthsError },
        settings: { data: settings, error: settingsError },
      });
    } catch (error) {
      console.error('Diagnostic test exception:', error);
      setResult({ exception: error });
    } finally {
      setLoading(false);
      console.log('=== DIAGNOSTIC TEST END ===');
    }
  };

  if (loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400">Running diagnostics...</div>;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-300 rounded">
      <h3 className="font-bold text-lg mb-2">Diagnostic Test Results</h3>
      <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
