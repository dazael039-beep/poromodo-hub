import { defineConfig } from 'vite';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ command }) => {
    const isBuild = command === 'build';

    return {
        plugins: [
            isBuild && javascriptObfuscator({
                options: { compact: true, controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.75, deadCodeInjection: true, deadCodeInjectionThreshold: 0.4, identifierNamesGenerator: 'mangled', transformObjectKeys: true },
            }),
        ],
    };
});