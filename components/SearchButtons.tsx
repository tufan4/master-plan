import { Search, GraduationCap, Wrench, Youtube } from "lucide-react";

export const SearchButtons = ({ topic }: { topic: string }) => {
    const openSearch = (type: string) => {
        let query = "";
        switch (type) {
            case "pdf":
                query = `${topic} pdf`;
                break;
            case "academic":
                query = `${topic} ders notları pdf`;
                break;
            case "app":
                query = `${topic} temelleri ve uygulamaları pdf`;
                break;
            case "youtube":
                query = `${topic} dersleri mühendislik`;
                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
                return;
        }
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    };

    return (
        <div className="flex flex-col gap-1 items-center bg-white/90 p-1.5 rounded-full shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm z-10 absolute right-2 -top-12">
            <button
                onClick={() => openSearch("pdf")}
                className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all tooltip relative group/btn"
                title="PDF Bul"
            >
                <Search size={14} />
                <span className="absolute right-full mr-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none">PDF Ara</span>
            </button>
            <button
                onClick={() => openSearch("academic")}
                className="p-1.5 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 transition-all relative group/btn"
                title="Akademik Kaynak"
            >
                <GraduationCap size={14} />
                <span className="absolute right-full mr-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none">Akademik Kaynak</span>
            </button>
            <button
                onClick={() => openSearch("app")}
                className="p-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all relative group/btn"
                title="Uygulama ve Pratik"
            >
                <Wrench size={14} />
                <span className="absolute right-full mr-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none">Uygulama</span>
            </button>
            <button
                onClick={() => openSearch("youtube")}
                className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all relative group/btn"
                title="YouTube Eğitim"
            >
                <Youtube size={14} />
                <span className="absolute right-full mr-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none">YouTube</span>
            </button>
        </div>
    );
};
