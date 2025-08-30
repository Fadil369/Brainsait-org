export declare const config: {
    server: {
        port: number;
        nodeEnv: any;
    };
    cors: {
        allowedOrigins: any;
    };
    puppeteer: {
        headless: boolean;
        executablePath: any;
        args: string[];
    };
    templates: {
        basePath: any;
        defaultLanguage: string;
        supportedLanguages: string[];
    };
    storage: {
        outputPath: any;
        tempPath: any;
        maxFileSize: number;
        cleanupInterval: number;
    };
    security: {
        maxRequestSize: string;
        rateLimitWindow: number;
        rateLimitMax: number;
    };
};
//# sourceMappingURL=environment.d.ts.map