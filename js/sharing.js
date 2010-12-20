/**
 * open SHaring Dialog
 *
 * @author Marvin Labod
 */

function openShareListDialog() {
	openDialog(generateDialog('Share List', generateShareListDialogHTML(), 'dialog-sharelist'));
}


$(function() {

	$(".sharep").click(function(){
		openShareListDialog();
	});
});