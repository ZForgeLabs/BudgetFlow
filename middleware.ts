import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	const isLogin = req.nextUrl.pathname.startsWith("/login");
	const isRoot = req.nextUrl.pathname === "/";
	if (!session && !isLogin) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}
	if (session && (isLogin || isRoot)) {
		const url = req.nextUrl.clone();
		url.pathname = "/dashboard";
		return NextResponse.redirect(url);
	}
	return res;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


