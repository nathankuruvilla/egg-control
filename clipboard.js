$(document).ready(function)
{
	$('form').on('submit', function()
	{
		var item = $('form input');
		var addInfo = {uName: uName.val(), numEggs: numEggs.val(), pickDate: pickDate.val()}
		  
		$ajax
		({
			type: '/Post',
			url: '/addEggs'
			data: addInfo,
			success: function(data)
			{
				location.reload();
			}
		})
	})
}

<tr class="blue-text">   <th>ID</th>  <th>Picker Name</th>  <th>Date Picked</th>  <th>Expiry Date</th>   </tr>
			<% for(var i =0; i<eggs.length; i++){ %>
				<tr>   
					<td></td> 
					<td></td> 
					<td></td> 
					<td></td>   
				</tr>
			<% } %>



<%= info[0].name %>