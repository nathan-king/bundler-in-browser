import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
 
export const unpkgPathPlugin = (inputCode: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // Handle root entry file of 'index.js'
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
          return {path: 'index.js', namespace: 'a'}
      });
      // Handle relative paths in modules ('./' and '../')
      build.onResolve({ filter: /^\.+\//}, (args: any) => {
          return {
              namespace: 'a',
              path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href,
          };
      });

      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
            namespace: 'a',
            path: `https://unpkg.com/${args.path}`
        }
      });
 
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
 
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        } 

        const { data, request } = await axios.get(args.path);
        return {
            loader: 'jsx',
            contents: data,
            resolveDir: new URL('./', request.responseURL).pathname
        };
      });
    },
  };
};