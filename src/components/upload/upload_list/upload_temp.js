let temp = lang => `
<div id="upload-list" class="upload-list" style="display: none">
  <div class="upload-list-header">
    <div class="upload-list-header-title">${lang.upload_list}</div>
    <div class="upload-list-header-tool">
      <i class="fa fa-window-maximize"></i>
      <i class="fa fa-window-minimize"></i>
      <i class="fa fa-close"></i>
    </div>
  </div>
  <div class="upload-list-body">
    <table style="width: 100%" cellpadding="0" cellspacing="0" border="0">
        <thead>
          <tr>
            <td style="width: 20%;">${lang.name}</td>
            <td style="width: 35%;">${lang.progress}</td>
            <td style="width: 15%;">${lang.size}</td>
            <td style="width: 15%;">${lang.time}</td>
            <td style="width: 15%;">
              <span class="cancel-all">${lang.cancel}</span>
            </td>
          </tr>
        </thead>
        <tbody id="body-list" is="transition-group" name="list">
          
        </tbody>
      </table>
  </div>
</div>
`

export default temp
