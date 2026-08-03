import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, MessageSquare, Info, CalendarDays, ClipboardList, Clock, Phone, Stethoscope } from 'lucide-react';
import ThemeToggleButton from '../Components/ThemeToggleButton';

export default function Welcome() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <Head title="Beranda" />

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo RS" className="h-8 w-auto" />
                        <span className="font-bold text-lg hidden sm:inline-block">RS Techno Medic</span>
                    </div>

                    <nav className="flex items-center gap-4 sm:gap-6">
                        <a href="#tentang" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">Tentang</a>
                        <a href="#kontak" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">Kontak</a>
                        <ThemeToggleButton />
                        <Link href="/login">
                            <Button variant="outline" size="sm">Masuk</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32">
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8">
                        <div className="flex-1 text-center lg:text-left space-y-6">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                                Kesehatan Anda,<br />
                                <span className="text-primary">Satu Chat Saja.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Tanya info rumah sakit, buat janji temu rawat jalan, atau sampaikan keluhan — semua dengan mudah dan cepat lewat chat AI kami.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                                <Link href="/chat">
                                    <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 font-bold gap-2">
                                        Mulai Chat Sekarang
                                        <MessageSquare className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <a href="#bantuan">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                                        Pelajari Lebih Lanjut
                                    </Button>
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center lg:justify-end items-center relative w-full max-w-md lg:max-w-none">
                            {/* Illustration placeholder using icons */}
                            <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                                <div className="relative bg-background border shadow-2xl rounded-2xl p-6 flex flex-col gap-4 w-64 rotate-[-6deg] hover:rotate-0 transition-all duration-300 z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="h-2 w-20 bg-muted rounded mb-1" />
                                            <div className="h-2 w-12 bg-muted rounded" />
                                        </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl rounded-tl-none p-3 self-start max-w-[85%]">
                                        <div className="h-2 w-32 bg-foreground/20 rounded mb-1.5" />
                                        <div className="h-2 w-24 bg-foreground/20 rounded" />
                                    </div>
                                    <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-none p-3 self-end max-w-[85%]">
                                        <div className="h-2 w-28 bg-primary-foreground/50 rounded mb-1.5" />
                                        <div className="h-2 w-16 bg-primary-foreground/50 rounded" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 bg-background border shadow-xl rounded-xl p-4 flex items-center gap-3 z-20 hover:scale-105 transition-transform duration-300">
                                    <CalendarDays className="h-8 w-8 text-blue-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground">Janji Temu</span>
                                        <span className="text-sm font-black text-foreground">Terkonfirmasi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="bantuan" className="bg-muted/30 py-20 border-y">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Apa yang bisa dibantu?</h2>
                            <p className="text-muted-foreground text-lg">Asisten virtual kami siap membantu berbagai kebutuhan administratif Anda kapan saja.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg mb-4">
                                        <Info className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">Info & Layanan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-foreground/80 leading-relaxed">
                                        Tanyakan jam operasional, persyaratan pendaftaran, jadwal dokter, hingga prosedur layanan BPJS dengan cepat.
                                    </CardDescription>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg mb-4">
                                        <CalendarDays className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">Janji Temu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-foreground/80 leading-relaxed">
                                        Cek ketersediaan slot jadwal dokter spesialis dan buat janji temu rawat jalan secara otomatis tanpa perlu antre di loket.
                                    </CardDescription>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg mb-4">
                                        <ClipboardList className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">Lapor Aduan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-foreground/80 leading-relaxed">
                                        Sampaikan keluhan atau masukan Anda terkait layanan rumah sakit. Dapatkan nomor tiket untuk melacak status penanganan aduan.
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Info Section */}
                <section id="kontak" className="container mx-auto px-4 md:px-6 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <Card className="bg-background">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-3 bg-secondary rounded-full">
                                    <Clock className="h-6 w-6 text-foreground" />
                                </div>
                                <CardTitle>Jam Operasional</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mt-4 text-foreground/80">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Senin - Jumat</span>
                                        <span>08:00 - 20:00</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Sabtu</span>
                                        <span>09:00 - 17:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Minggu / Libur</span>
                                        <span>09:00 - 14:00</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-primary/20">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <Phone className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <CardTitle>Layanan Darurat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Hotline IGD & Ambulans</p>
                                        <p className="text-4xl font-black text-foreground">119</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg flex items-start gap-3">
                                        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Layanan Gawat Darurat (IGD) kami beroperasi 24 jam setiap hari tanpa hari libur.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-secondary text-secondary-foreground border-t">
                <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logo.png" alt="Logo RS" className="h-6 w-auto grayscale opacity-80" />
                                <span className="font-bold text-xl">RS Techno Medic</span>
                            </div>
                            <p className="text-sm text-secondary-foreground/70 mb-4 leading-relaxed">
                                Jl. Ringroad Selatan, Menayu Lor, Tirtonirmolo, Kec. Kasihan, Kabupaten Bantul, Daerah Istimewa Yogyakarta
                            </p>
                            <div className="text-sm text-secondary-foreground/70 space-y-1">
                                <p>Telp: +62 895-4033-88880</p>
                                <p>Email: technomedic.id@gmail.com</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 sm:gap-24">
                            <div className="space-y-4">
                                <h4 className="font-bold text-foreground">Tautan Cepat</h4>
                                <ul className="space-y-2 text-sm text-secondary-foreground/80">
                                    <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4">Tentang Kami</a></li>
                                    <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4">Fasilitas</a></li>
                                    <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4">Jadwal Dokter</a></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-foreground">Bantuan</h4>
                                <ul className="space-y-2 text-sm text-secondary-foreground/80">
                                    <li><Link href="/chat" className="hover:text-foreground hover:underline underline-offset-4">Chat CS AI</Link></li>
                                    <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4">Kebijakan Privasi</a></li>
                                    <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4">Syarat & Ketentuan</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/60 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© 2026 RS Techno Medic. Hak Cipta Dilindungi.</p>
                        <p>Powered by Asisten AI Customer Service</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
