declare module "*.css";

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        __chiizuShadowPatched?: boolean;
    }
}

// This empty export forces TS to apply the 'declare global' block!
export { };
