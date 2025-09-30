"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/AuthContext';
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import AppBar from "@/components/AppBar"
import Link from "next/link"

export default function ProfilePage() {
    const { user, token, logout } = useAuth();

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("/avatar.jpg")

    useEffect(() => {
        if (user) {
            setName(user.firstName + user.lastName || "")
            setEmail(user.email || "")
        }
    }, [user])

    const handleSaveChanges = async () => {
        try {
            const res = await fetch("/api/profile/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, email }),
            })

            if (!res.ok) throw new Error("Failed to update profile")
            alert("Profile updated successfully!")
        } catch (err) {
            console.error(err)
            alert("Error updating profile")
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => setAvatarUrl(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const logs = [
        "Checked in at 10:12 AM (Main Gate)",
        "Checked out at 12:45 PM",
        "Checked in at 9:03 AM (Admin Block)",
        "Checked out at 1:30 PM",
    ]

    return (
        <div>
            <AppBar />
            <div className="md:max-w-4xl w-full mx-auto p-6 mt-3 md:mt-8 overflow-hidden">
                <h1 className="text-2xl font-bold mb-6">My Profile</h1>

                {/* Profile Overview */}
                <Card className="p-6">
                    <div className="flex items-center gap-6 mb-2">
                        <Avatar className="h-18 w-18">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="font-bold">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>

                            {user?.id && (
                                <h2 className="mt-2 text-muted-foreground text-sm">
                                    Name: <span className="font-medium">{user.firstName} {user.lastName}</span>
                                </h2>
                            )}
                            {user?.role && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Role: <span className="font-medium">{user.role}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mb-4" onChange={handleAvatarChange}>
                        <Button className="text-xs text-white mt-1">Upload a profile picture</Button>
                    </div>

                    <CardContent className="grid gap-4">
                        <div className="flex flex-col gap-2 md:gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="flex flex-col gap-2 md:gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="flex justify-between mt-4">
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Logs */}
                <Card className="mt-6 p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <ScrollArea className="h-40">
                        <ul className="space-y-2 text-sm">
                            {logs.map((log, idx) => (
                                <li key={idx} className="text-muted-foreground">
                                    <span className="font-medium">[{new Date().toLocaleDateString()}]</span> • {log}
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </Card>

                {/* Visit Summary */}
                <Card className="mt-6 p-6">
                    <h2 className="text-lg font-semibold mb-4">Visit Summary</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Total Check-ins</p>
                            <p className="font-semibold">12</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Total Check-outs</p>
                            <p className="font-semibold">11</p>
                        </div>
                    </div>
                </Card>

                {/* Change Password */}
                <Card className="mt-6 p-6">
                    <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                    <CardContent className="grid gap-4">
                        <div className="flex flex-col gap-2 md:gap-3">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input type="password" id="current-password" />
                        </div>
                        <div className="flex flex-col gap-2 md:gap-3">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input type="password" id="new-password" />
                        </div>
                        <Button className="mt-4 w-fit">Update Password</Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="mt-6 p-6 border border-red-500">
                    <h2 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h2>
                    <Button variant="destructive" className="w-fit" onClick={() => alert("Account deletion requested")}>Request Account Deletion</Button>
                </Card>

                {/* Admin Audit Log */}
                {user?.role === 'admin' && (
                    <Link href="/admin/dashboard">
                        <Button variant="outline" className="mt-4">View Audit Logs</Button>
                    </Link>
                )}

                {/* Logout */}
                <div className="flex flex-col items-end justify-center">
                    <Separator className="my-4" />
                    <Button variant="destructive" onClick={logout}>Log Out</Button>
                </div>
            </div>
        </div>
    )
}
