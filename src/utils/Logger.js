/**
 * Simple logger for debugging SDK behavior
 */
export class Logger {
    constructor(enabled = false, level = 'info') {
        this.enabled = enabled;
        this.level = level;
        this.levels = ['debug', 'info', 'warn', 'error'];
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setLevel(level) {
        if (this.levels.includes(level)) {
            this.level = level;
        }
    }

    shouldLog(messageLevel) {
        if (!this.enabled) return false;
        const currentLevelIndex = this.levels.indexOf(this.level);
        const messageLevelIndex = this.levels.indexOf(messageLevel);
        return messageLevelIndex >= currentLevelIndex;
    }

    debug(message, data = null) {
        if (this.shouldLog('debug')) {
            console.log(`[Creeble DEBUG] ${message}`, data || '');
        }
    }

    info(message, data = null) {
        if (this.shouldLog('info')) {
            console.info(`[Creeble INFO] ${message}`, data || '');
        }
    }

    warn(message, data = null) {
        if (this.shouldLog('warn')) {
            console.warn(`[Creeble WARN] ${message}`, data || '');
        }
    }

    error(message, data = null) {
        if (this.shouldLog('error')) {
            console.error(`[Creeble ERROR] ${message}`, data || '');
        }
    }

    logRequest(method, url, params = null) {
        this.debug(`${method} Request: ${url}`, params);
    }

    logResponse(method, url, response, duration) {
        this.debug(`${method} Response: ${url} (${duration}ms)`, {
            status: response.status || 'success',
            dataLength: response.data ? (Array.isArray(response.data) ? response.data.length : 1) : 0
        });
    }

    logError(method, url, error, duration) {
        this.error(`${method} Error: ${url} (${duration}ms)`, {
            message: error.message,
            statusCode: error.statusCode
        });
    }
}

// Default singleton instance
export const logger = new Logger();