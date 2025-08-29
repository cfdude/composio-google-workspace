module.exports = {
  apps: [{
    name: 'google-workspace-tools',
    script: 'dist/service.js',
    cwd: '/Users/robsherman/Servers/composio-google-workspace',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      LOG_LEVEL: 'info'
    },
    
    // Restart policy
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Auto restart on file changes (disable in production)
    watch: false,
    ignore_watch: ['node_modules', 'logs', '*.log'],
    
    // Logging
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Auto-restart configurations
    autorestart: true,
    max_memory_restart: '1G',
    
    // Health monitoring
    health_check_url: 'http://localhost:8080/health',
    health_check_grace_period: 3000
  }]
}