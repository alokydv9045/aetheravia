// Ambient module declarations for style imports so TS accepts side-effect CSS imports
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';

// Common pattern for CSS Modules (not used for globals, but helpful across the app)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}