const pool = require('./config/database');

(async () => {
  try {
    const [results] = await pool.execute(
      'SELECT id, step_order, bengali_description, base_percentage, is_dynamic_calculation FROM progress_step_definitions WHERE implementation_method = ? ORDER BY step_order',
      ['tender']
    );
    
    console.log('\n=== Tender Progress Steps in Live Database ===\n');
    results.forEach(row => {
      console.log(`${row.step_order}. [${row.id}] ${row.bengali_description} - ${row.base_percentage}% ${row.is_dynamic_calculation ? '(Dynamic)' : ''}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Database Error:', err.message);
    process.exit(1);
  }
})();
