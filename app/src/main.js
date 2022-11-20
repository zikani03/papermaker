import { createApp } from 'vue'
import {
    Button,
    Cell,
    CellGroup,
    Checkbox,
    Col,
    Collapse,
    CollapseItem,
    Divider,
    Empty,
    Field,
    List,
    NavBar,
    Notify,
    Picker,
    Popup,
    Switch,
    Radio,
    RadioGroup,
    Tab,
    Tabs,
} from 'vant'
import './style.css'
import 'vant/lib/index.css';
import App from './App.vue'

const app = createApp(App)

app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Checkbox)
app.use(Col)
app.use(Collapse)
app.use(CollapseItem)
app.use(Divider)
app.use(Empty)
app.use(Field)
app.use(List)
app.use(NavBar)
app.use(Notify)
app.use(Picker)
app.use(Popup)
app.use(Radio)
app.use(RadioGroup)
app.use(Switch)
app.use(Tab)
app.use(Tabs)
// Register Lazyload directive
// app.use(vant.Lazyload);

window._wasmModuleLoaded = false;
let mountedApp = app.mount('#app')

fetch("main.wasm").then(wasmModule => {
  const go = new Go();
  WebAssembly.instantiateStreaming(wasmModule, go.importObject)
    .then((result) => {
      window._wasmModuleLoaded = true;
      mountedApp.isWasmModuleLoaded = true;
      // vant.Notify({ type: 'success', message: 'Loaded resources for Offline functionality... You can use the app offline' });
      go.run(result.instance);
    })
    .catch(err => {
      vant.Notify({ type: 'warning', message: 'Failed to load resources for Offline functionality. You can still use the app but will need an internet connection. Try to reload the page' });
      console.error("Failed to load WASM module, try to reload the page... will use online API to process requests")
      window._wasmModuleLoaded = false;
      mountedApp.isWasmModuleLoaded = false;
      mountedApp.useOfflineMode = false;
    })
})
