import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import lessToJS from 'less-vars-to-js';
import withLess from 'next-with-less';
import withPlugins from 'next-compose-plugins';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const antdVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, 'src/styles/variables.less'), 'utf8'));

const config = {
  transpilePackages: ['antd'],
  // pageExtensions: ['jsx', 'tsx'],
  webpack: (config) => {
    if (isServer) {
      const antStyles = /antd\/.*?\/style.*?/;
      const origExternals = [...config.externals];
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback();
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals)
      ];

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader'
      });
    }
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    });
    config.plugins.push(
      new webpack.EnvironmentPlugin({
        NODE_ENV: process.env.NODE_ENV,
        'THEME': { ...antdVariables },
      }),
    );

    return config;
  },
};

const plugins = [
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  }),
  withLess({
    lessLoaderOptions: {
      // lessVarsFilePath: './src/styles/variables.less',
      lessOptions: {
        modifyVars: {
          "primary-color": "#9900FF",
          "border-radius-base": "2px",
        },
      },
    },
  }),
];

export default withPlugins(plugins, config);