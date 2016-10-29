import 'babel-polyfill';
import {AppRegistry} from 'react-native';
import Noder from './src';


AppRegistry.registerComponent('GIT', () => Noder);

var app = document.createElement('div');
document.body.appendChild(app);

AppRegistry.runApplication('GIT', {
    rootTag: app
});
