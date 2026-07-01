/**
 * Logger utility for logging messages in the svg2gpu library.
 *
 * By default, all log levels are enabled:
 *
 * ```typescript
 * Logger.SHOW_ERRORS = true;
 * Logger.SHOW_WARNINGS = true;
 * Logger.SHOW_DEBUG = true;
 * Logger.SHOW_INFO = true;
 * Logger.SHOW_LOG = true;
 * ```
 *
 * You can control the visibility of each log level by setting these properties to `false`.
 */
export class Logger {
	public static SHOW_ERRORS: boolean = true;
	public static SHOW_WARNINGS: boolean = true;
	public static SHOW_DEBUG: boolean = true;
	public static SHOW_INFO: boolean = true;
	public static SHOW_LOG: boolean = true;

	public static error(message: string, context?: any): void {
		if (!Logger.SHOW_ERRORS) return;
		if (context) {
			console.error(`[svg2gpu]: ${message}`, context);
		} else {
			console.error(`[svg2gpu]: ${message}`);
		}
	}

	public static warn(message: string, context?: any): void {
		if (!Logger.SHOW_WARNINGS) return;
		if (context) {
			console.warn(`[svg2gpu]: ${message}`, context);
		} else {
			console.warn(`[svg2gpu]: ${message}`);
		}
	}

	public static info(message: string, context?: any): void {
		if (!Logger.SHOW_INFO) return;
		if (context) {
			console.info(`[svg2gpu]: ${message}`, context);
		} else {
			console.info(`[svg2gpu]: ${message}`);
		}
	}

	public static debug(message: string, context?: any): void {
		if (!Logger.SHOW_DEBUG) return;
		if (context) {
			console.debug(`[svg2gpu]: ${message}`, context);
		} else {
			console.debug(`[svg2gpu]: ${message}`);
		}
	}

	public static log(message: any, context?: any): void {
		if (!Logger.SHOW_LOG) return;
		if (context) {
			console.log(`[svg2gpu]: ${message}`, context);
		} else {
			console.log(`[svg2gpu]: ${message}`);
		}
	}
}
