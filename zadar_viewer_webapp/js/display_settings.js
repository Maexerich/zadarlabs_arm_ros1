customElements.define("display-settings-color-menu", class extends LitElement {
  static properties = {
    default_value: {}
  }

  selectedOption(e){
    const user_color_mode = parseInt(e.target.value);
    console.log("Selected Option: ", user_color_mode)
    Controls.color_mode = user_color_mode;
    setParamToServer("viewer_settings/color_mode",`${user_color_mode}`,"int")
  }

  constructor(){
    super()
    this.selected_mode = Controls.color_mode;
    asyncGetParamFromServer("viewer_settings/color_mode", "int", (val) => {
      this.selected_mode = val;
      Controls.color_mode = val;
    }
    )
  }

  static styles = css`
  .toplevel{
    display: flex;
  }
  .options-container{
    display: flex;
    
  }
  .option{
    display: flex;
    flex-direction: column-reverse;
    padding: 1vw;
  }
  .left{
    margin-right: auto;
  }
  `

  render(){
    return html`
    <div class="toplevel">
    <div class="params-item-label left">
        Point-Color Options
    </div>
    <div class="options-container">
        <div class="option">
            <label>SNR</label>
            <input type="radio" name="param-color-mode"  value="0" @click=${this.selectedOption} ?checked=${this.selected_mode === 0}}>
        </div>
        <div class="option">
            <label>Height</label>
            <input type="radio" name="param-color-mode"  value="1" @click=${this.selectedOption} ?checked=${this.selected_mode === 1}>
        </div>
        <div class="option">
            <label>Range</label>
            <input type="radio" name="param-color-mode" display="inline-block" value="2" @click=${this.selectedOption} ?checked=${this.selected_mode === 2}>
        </div>
        <div class="option">
            <label>Radar</label>
            <input type="radio" name="param-color-mode" display="inline-block" value="3" @click=${this.selectedOption} ?checked=${this.selected_mode === 3}>
        </div>
        <div class="option">
            <label>Doppler</label>
            <input type="radio" name="param-color-mode" display="inline-block" value="4" @click=${this.selectedOption} ?checked=${this.selected_mode === 4}>
        </div>
    </div>
    </div>
    `
  }
})

customElements.define("display-settings-zoom-menu", class extends LitElement {
  ZoomOptions = [30,100,200,400,600];

  _zoom_button_clicked(ev){
    const new_zoom_value = parseInt(ev.target.value);
    console.log("Zoom value is now "+new_zoom_value);
    setBirdsEyeView(new_zoom_value);
  }

  static styles = css`
  .toplevel{
      display: flex;
    }
  .left{
    margin-right: auto;
  }
  `

  render(){
    let button_string = (val) => html`<input type="button" @click=${this._zoom_button_clicked} value="${val}" class="">`
    return html`
    <div class="toplevel">
      <div class="left">
          Zoom
      </div>
      <div class="">
          ${this.ZoomOptions.map(zoomValue => button_string(zoomValue))}
      </div>
    </div>
    `
  }
})

customElements.define("display-settings-color-min-max-menu", class extends LitElement {
  static properties = {
    color_scale_min: {},
    color_scale_max: {}
  };

  constructor(){
    super();
    this.color_scale_max = Controls.color_maximum;
    this.color_scale_min = Controls.color_minimum;
  }

  setMin(e){
    const new_value = parseFloat(e.target.value);
    Controls.color_minimum = new_value
    this.color_scale_min = new_value
  }

  setMax(e){
    const new_value = parseFloat(e.target.value);
    Controls.color_maximum = new_value
    this.color_scale_max = new_value
  }

  static styles = css`
    .toplevel{
      display: flex
    }
    .left{
      margin-right: auto
    }
  `

  render(){
    return html`
      <div class=toplevel>
        <div class=left>
          Color Scale
        </div>
        <div class="params-item-value right">
            <label for="param-color-scale-min">Min</label>
            <input type="number" @change=${this.setMin} class="" min="-10" max="${this.color_scale_max}" step="0.1" value="${this.color_scale_min}">
            <label for="param-color-scale-max">Max</label> 
            <input type="number" @change=${this.setMax} class="" min="${this.color_scale_min}" max="10" step="0.1" value="${this.color_scale_max}">
        </div>
      </div>
    `;
  }

})

customElements.define("display-point-size-menu", class extends LitElement {
  static properties = {
    point_size: {}
  }

  static styles = css`
    .toplevel{
      display: flex;
    }
    .left{
      margin-right: auto;
    }
  `
  constructor(){
    super()
    this.point_size = 0.5
  }

  _change_point_size(e){
    const new_size = parseFloat(e.target.value);
    Controls.point_size = new_size;
  }

  render(){
    return html`
      <div class=toplevel>
        <div class="left">
          Point Size
        </div>
        <div class="right">
          <input type=number min="0" max="2.5" step="0.05" value="${this.point_size}" @change=${this._change_point_size}>
        </div>
      </div>
    `
  }
})




class DisplayMenu extends LitElement {
  constructor(){
    super()
  }
  
  render () {
    return html`
      <display-settings-zoom-menu></display-settings-zoom-menu>
      <display-settings-color-menu></display-settings-color-menu>
      <display-point-size-menu></display-point-size-menu>
      <display-settings-color-min-max-menu></display-settings-color-min-max-menu>
    `;
  }
}
customElements.define('display-settings-menu', DisplayMenu);

