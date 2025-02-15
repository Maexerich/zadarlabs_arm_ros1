customElements.define("device-menu-modes-table", class extends LitElement{
  static properties = {
    modes: {}
  }

  constructor(){
    super()
    this.modes = []
  }

  connectedCallback(){
    super.connectedCallback()
    fetch(HOST+'/modes', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.info(data)
        this.modes = data;
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
  }

  _start_mode_callback_maker(mode){

    function set_mode(mode_number){
      const data = {
        mode: mode_number
      };
      console.log(data);
      fetch(HOST+'/device/mode', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
      }).then(response => {
          return response.text()
      }).then((response) => {
        console.log(response)
      })
      .catch(error => {
          console.error('There was a problem with your fetch operation:', error);
      });
    }

    return () => {
      console.log("User wants to start mode: "+mode)
      set_mode(mode)
    }
  }

  render(){
    const rows = this.modes.map((row) => html`<tr>
    <td>${row.number}</td> <td>${row.description}</td> <td><button @click=${this._start_mode_callback_maker(row.number)}>Start Mode</button></td>
    </tr>`)
    return html`
    <table>
      <thead>
        <tr>
          <th>Mode #</th>
          <th>Description</th>
          <th>Start (Note not immediate)</th>
        </tr>
      </thead>
      <tbody id="device-mode-table">
      ${rows}
      </tbody>
    </table>
    `
  }
})

customElements.define('device-menu', class extends LitElement {
  render(){
    return html`
    <div>On Board</div>
    <device-menu-modes-table></device-menu-modes-table>
    `
  }
})