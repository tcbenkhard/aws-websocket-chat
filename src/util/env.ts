export const getEnvironmentVariable = (name: string, defaultValue?: string) => {
    const actualValue = process.env[name];
    if(!actualValue && defaultValue) {
        console.log(`Returning default value [${defaultValue}] for variable [${name}]`);
        return defaultValue;
    } else if (actualValue) {
        console.log(`Returning actual value [${actualValue}] for [${name}]`);
        return actualValue;
    }
    throw new Error(`Missing environmental variable [${name}]`);
}