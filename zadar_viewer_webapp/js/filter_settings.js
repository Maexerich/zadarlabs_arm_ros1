customElements.define('filter-menu-for-radar', class extends LitElement {
  static properties = {
    radar_id: {},
    x_min: {},
    x_max: {},
    y_min: {},
    y_max: {},
    z_min: {},
    z_max: {},
    range_min: {},
    range_max: {},
    show_options: {}
  }

  _set_x_min(e){ const val = parseFloat(e.target.value); this.x_min = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/min_x",`${val}`,'int');}
  _set_x_max(e){ const val = parseFloat(e.target.value); this.x_max = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/max_x",`${val}`,'int');}
  _set_y_min(e){ const val = parseFloat(e.target.value); this.y_min = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/min_y",`${val}`,'int');}
  _set_y_max(e){ const val = parseFloat(e.target.value); this.y_max = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/max_y",`${val}`,'int');}
  _set_z_min(e){ const val = parseFloat(e.target.value); this.z_min = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/min_z",`${val}`,'int');}
  _set_z_max(e){ const val = parseFloat(e.target.value); this.z_max = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/max_z",`${val}`,'int');}
  _set_range_min(e){ const val = parseFloat(e.target.value); this.range_min = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/min_range",`${val}`,'int');}
  _set_range_max(e){ const val = parseFloat(e.target.value); this.range_max = val;setParamToServer(`radar${this.radar_id}/`+"filtering/common/max_range",`${val}`,'int');}

  connectedCallback(){
    super.connectedCallback()
    const radar_path = `radar${this.radar_id}/`
    asyncGetParamFromServer(radar_path+"filtering/common/min_x", "int", (val) => {
      this.x_min = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/max_x", "int", (val) => {
      this.x_max = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/min_y", "int", (val) => {
      this.y_min = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/max_y", "int", (val) => {
      this.y_max = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/min_z", "int", (val) => {
      this.z_min = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/max_z", "int", (val) => {
      this.z_max = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/min_range", "int", (val) => {
      this.range_min = val;
    })
    asyncGetParamFromServer(radar_path+"filtering/common/max_range", "int", (val) => {
      this.range_max = val;
    })
  }
  

  constructor(){
    super()
    this.radar_id = 0;
    this.x_min=0
    this.show_options = false;
  }

  static styles = css`
    .control-block{
      display: flex;
      padding: 10px;
    }
    .control-block>* {
      flex-direction: column-reverse;
    }
    .left{
      margin-right: auto;
    }
    .radar_selector{
      width: 100%;
      text-align: center;
      background-color: rgb(182, 182, 182);
      border-radius: 10px;
      padding: 3px
    }
    .radar_selector:hover{
      background-color: rgb(230, 230, 230);
      cursor: pointer
    }
  `;

  render(){
    return html`
      <div class="radar_selector" @click=${() => {this.show_options ^= 1;}}>Radar${this.radar_id}</div>
      <div class = "options" style=${styleMap({display: this.show_options?"":"none"})}>
      <div>
        <div class=control-block id="x-controls">
          <div class="left">X</div>
          <div class="right">
            <div>
            <label>Min</label>
            <input type=number @change=${this._set_x_min} min=-1000 max=1000 value="${this.x_min}">
            </div>

            <div>
            <label>Max</label>
            <input type=number @change=${this._set_x_max} min=-1000 max=1000 value="${this.x_max}">
            </div>
          </div>
        </div>


        <div class="control-block" id="y-controls">
          <div class="left">Y</div>
          <div>
            <div>
            <label>Min</label>
            <input type=number @change=${this._set_y_min} min=-1000 max=1000 value="${this.y_min}">
            </div>

            <div>
            <label>Max</label>
            <input type=number @change=${this._set_y_max} min=-1000 max=1000 value="${this.y_max}">
            </div>
          </div>
        </div>

        <div class="control-block" id="z-controls">
          <div class="left">Z</div>
          <div>
            <div>
            <label>Min</label>
            <input type=number @change=${this._set_z_min} min=-1000 max=1000 value="${this.z_min}">
            </div>

            <div>
            <label>Max</label>
            <input type=number @change=${this._set_z_max} min=-1000 max=1000 value="${this.z_max}">
            </div>
          </div>
        </div>

        <div class="control-block" id="range-controls">
          <div class="left">Range</div>
          <div>
            <div>
            <label>Min</label>
            <input type=number @change=${this._set_range_min} min=-1000 max=1000 value="${this.range_min}">
            </div>

            <div>
            <label>Max</label>
            <input type=number @change=${this._set_range_max} min=-1000 max=1000 value="${this.range_max}">
            </div>
          </div>
        </div>
      </div>  
    `
  }
})

customElements.define('filter-menu-radars', class extends LitElement {
  static properties = {
    radar_number: {}
  }

  constructor(){
    super()
  }
  

  render(){
    const itemTemplate = (index) => html`<filter-menu-for-radar radar_id="${index}"></filter-menu-for-radar>`;
    const content = Array(parseInt(this.radar_number)).fill(0).map((v,i) => itemTemplate(i))
    return html`
      ${
       html`${content}` 
      }
    `
  }
})

customElements.define('filter-menu-globals', class extends LitElement {
  static propreties = {
    track_filter: {state: true}
  }

  constructor(){
    super();
    this.track_filter = false;
  }

  connectedCallback(){
    super.connectedCallback();
    asyncGetParamFromServer("viewer_settings/use_heatmap_filter", "bool", (val) => {
      this.track_filter =  val === "0";
   })
  }

  _toggleHeatMapFilter(){
    this.track_filter ^= 1; 
    setParamToServer("viewer_settings/use_heatmap_filter",this.track_filter? "1": "0","bool")
  }

  render(){
    return html`
      <label>Automatic Tracks Filtering</label>
      <input @click=${this._toggleHeatMapFilter} type=checkbox name=param-auto-filter-tracks ?checked=${this.track_filter}>
    `
  }
})

customElements.define('filter-menu', class extends LitElement {
  static properties = {
    loading: {},
    radar_number: {}
  }

  constructor(){
    super()
    this.loading = true;
    this.radar_number = undefined;
  }

  connectedCallback(){
    super.connectedCallback()
    if (onDeviceViewer){
      radar_count = 1;
      return;
    }
    asyncGetParamFromServer("radar_number", "int", (val) => {
      let radar_count = parseInt(val);
      this.radar_number = radar_count;
    })
  }

  render(){
    const content = (this.radar_number !== undefined)? html`<filter-menu-radars radar_number="${this.radar_number}"></filter-menu-radars>`: html`<div>Blank</div>`
    return html`
      <filter-menu-globals></filter-menu-globals>
      ${content}
    `
  }
})