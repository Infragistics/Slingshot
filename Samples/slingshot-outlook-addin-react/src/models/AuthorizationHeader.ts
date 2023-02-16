export interface IAuthorizationHeader {
	headers: {
		Authorization: string
	}
}

export class AuthorizationHeader {
	private header: IAuthorizationHeader

	constructor(token) {
		this.header = {
			headers: {
				Authorization: token
			}
		}
	}

	public get() {
		return this.header;
	}

	public post(body: any) {
		return {
			method: "POST",
			headers: {
				Authorization: this.header.headers.Authorization,
				"Content-type": "application/json; charset=UTF-8"
			},
			body: JSON.stringify(body)
		};
	}
}