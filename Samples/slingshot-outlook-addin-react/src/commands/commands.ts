let _mailbox;
let _customProps;

Office.onReady(() => {
});

/**
 * @param event
 */
function action(event: Office.AddinCommands.Event) {
	const message: Office.NotificationMessageDetails = {
		type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
		message: "Performed action.",
		icon: "Icon.80x80",
		persistent: true
	};

	Office.context.mailbox.item.notificationMessages.replaceAsync("action", message);

	event.completed();
}

function itemChanged(_eventArgs) {
	UpdateTaskPaneUI(Office.context.mailbox.item);
}

function UpdateTaskPaneUI(item) {
	if (item != null) console.log(item.subject);
}

function getGlobal() {
	return typeof self !== "undefined"
		? self
		: typeof window !== "undefined"
			? window
			: typeof global !== "undefined"
				? global
				: undefined;
}

const g = getGlobal() as any;

g.action = action;