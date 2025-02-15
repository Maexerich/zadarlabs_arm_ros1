class Header extends LitElement {
  render() {
    return html`
    <div class="header">
                <div class="logo" style="text-align: center;">
                    <img src="style/zadar_logo_2.webp" alt="zadar_logo" width="70" style="margin-bottom:30px;">
                </div>
    </div>
    `;
  }
}

class ControlBar extends LitElement {
  // Render the UI as a function of component state
  render() {
    return html`
      <controls-header></controls-header>
      <submenu-options></submenu-options>
      `;
  }
}

customElements.define('submenu-options', class extends LitElement {
  static properties = {
    enabled_display: {},
    enabled_filters: {},
    enabled_tracking_table: {},
    enabled_device_manager: {},
    displayDeviceMenu: {}
  };
  
  _pressed_display (e){
    this.enabled_display ^= 1;
  }

  _pressed_filters (e){
    this.enabled_filters ^= 1;
  }

  _pressed_tracking_table (e){
    this.enabled_tracking_table ^= 1;
  }

  _pressed_device_manager (e){
    this.enabled_device_manager ^= 1;
  }

  static styles = css`
  .menu-button{
    width: 100%;
    text-align: center;
    background-color: rgb(182, 182, 182);
    border-radius: 10px;
    padding: 3px;
  }
  .menu-button:hover{
    background-color: rgb(230, 230, 230);
    cursor: pointer;
  }
  .params {
    border-left-width: 5px;
    border-left-color: grey;
    border-left-style: solid;
  }
  `

  constructor() {
    super()
    this.enabled_display = false
    this.enabled_filters = false
    this.enabled_tracking_table = false
    this.enabled_device_manager = false
    function isLocalFile(url) {
      // Check if the URL starts with "file://" or "http://localhost" or "http://127.0.0.1"
      return url.startsWith("file://") || url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1");
    }
    const onDeviceViewer = !isLocalFile(window.location.href);
    this.displayDeviceMenu = onDeviceViewer;
  }
  render () {
    return html`
    <div class=option-container>
    ${this.displayDeviceMenu? html`
    <div class=option-container>
      <div class="menu-button" @click=${this._pressed_device_manager}>Device Manager</div>
      <div class=params>
      <device-menu style=${styleMap({display: this.enabled_device_manager?"":"none"})}></device-menu>
    </div>` : ""}
      <div class="menu-button" @click=${this._pressed_display}>Display</div>
      <div class=params>
      <display-settings-menu style=${styleMap({display: this.enabled_display?"":"none"})}></display-settings-menu>
    </div>

    <div class=option-container>
      <div class="menu-button" @click=${this._pressed_filters}>Filters</div>
      <div class=params>
      <filter-menu style=${styleMap({display: this.enabled_filters?"":"none"})}></filter-menu>
    </div>

    <div class=option-container>
      <div class="menu-button" @click=${this._pressed_tracking_table}>Tracking Table</div>
      <div class=params>
      <tracking-table style=${styleMap({display: this.enabled_tracking_table?"":"none"})}></tracking-table>
    </div>
    `;
  }
});



customElements.define('controls-header', Header);
customElements.define('control-bar', ControlBar);