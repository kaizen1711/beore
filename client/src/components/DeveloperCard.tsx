import { MessageCircle, MapPin, GraduationCap, Calendar } from "lucide-react";

export function DeveloperCard() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/6281266950382", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 hover-lift transition-all duration-300">
      <h3 className="text-xl font-semibold mb-6 text-foreground text-center flex items-center justify-center">
        <span className="text-2xl mr-2">👨‍💻</span>
        Developer
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img 
            src="https://files.catbox.moe/qfamnx.jpg" 
            alt="Foto profil developer aka" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-primary/20 hover:border-primary/40 transition-colors object-cover"
          />
        </div>
        
        {/* Developer Info */}
        <div className="text-center sm:text-left">
          <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">aka</h4>
          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground mb-4">
            <p className="flex items-center justify-center sm:justify-start">
              <Calendar className="mr-2" size={12} />
              15 tahun
            </p>
            <p className="flex items-center justify-center sm:justify-start">
              <MapPin className="mr-2" size={12} />
              Sumatera Barat
            </p>
            <p className="flex items-center justify-center sm:justify-start">
              <GraduationCap className="mr-2" size={12} />
              Pelajar
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-2 sm:p-3 mb-4">
            <p className="text-xs sm:text-sm italic text-muted-foreground">
              "gw hanya pemula 🗿"
            </p>
          </div>
          
          <button 
            onClick={handleWhatsAppClick}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-xs sm:text-sm font-medium hover-lift"
          >
            <MessageCircle className="mr-2" size={14} />
            Hubungi via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
