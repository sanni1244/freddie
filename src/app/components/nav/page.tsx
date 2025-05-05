import React from 'react'
import Logo from "../logo";
import Link from 'next/link';


export const Nav = () => {
    return (
        <nav className="flex justify-between items-center p-4">
            <span className="flex items-center gap-2">
                <Logo />
                <b>Freddie</b>
            </span>
            <span className="flex gap-4">
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
            </span>
        </nav>
    )
}
