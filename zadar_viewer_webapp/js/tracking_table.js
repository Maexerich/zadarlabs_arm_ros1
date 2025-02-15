customElements.define('tracking-table', class extends LitElement {
  static properties = {
    tracks: {state:true}
  }

  constructor(){
    super()
    this.tracks = {}
  }

  _update_tracks(tracks){
    this.tracks = tracks;
  }

  connectedCallback(){
    super.connectedCallback();
    // Have to pass the method binding the object to it, so that it remains aware of this object
    TRACK_CALLBACK = this._update_tracks.bind(this);
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    TRACK_CALLBACK = null;
  }

  static styles = css`table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  table{
    width:100%;
  }
  .toplevel {
    min-height: 250px;
  }
  tr, td {
    height: 0px;
  }
  `

  render(){
    let rows = new Array()

    Array.from(Object.keys(this.tracks)).forEach((radar_id) => {
      this.tracks[radar_id].forEach((track) => {
        var track_id = track[3];
        var class_id = track[4];
        var speed = track[5];
        var range = track[0];
        // Define the columns (cells) for the current row
        var new_row = [radar_id, track_id, Number(range.toFixed(2)), Number(speed.toFixed(2)), class_id];
        rows.push(new_row)
      })
    })

    const table_rows = rows.map((row) => {
      let row_content = row.map((val) => html`<td>${val}</td>`)
      return html`<tr>${row_content}</tr>`
    })

    return html`
    <div clas=toplevel>
    <table>
      <thead>
          <tr><th>RadarID</th><th>Id</th><th>Range</th><th>Speed</th><th>Class</th></tr>
      </thead>
      <tbody id="tracking-table-entries">
        ${table_rows}
      </tbody>
  </table>
  </div>
    `
  }
})