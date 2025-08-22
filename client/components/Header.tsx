import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Home, 
  Grid3x3, 
  Search, 
  Sparkles 
} from "lucide-react";

export default function Header() {
  const location = useLocation();

  const activities = [
    {
      title: "Gerador de Cruzadinhas",
      description: "Crie cruzadinhas personalizadas com palavras e dicas",
      icon: Grid3x3,
      path: "/cruzadinha",
      color: "text-blue-600",
    },
    {
      title: "Gerador de Caça-Palavras",
      description: "Crie caça-palavras envolventes e desafiadores",
      icon: Search,
      path: "/caca-palavras",
      color: "text-emerald-600",
    },
    {
      title: "Bingo de Palavras",
      description: "Crie cartelas de bingo personalizadas",
      icon: Sparkles,
      path: "/bingo-palavras",
      color: "text-purple-600",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
          >
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gerador de Atividades
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {/* Home Button */}
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Início
              </Button>
            </Link>

            {/* Activities Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" />
                    Atividades
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      {activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <Link
                            key={activity.path}
                            to={activity.path}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${activity.color}`} />
                              <div>
                                <div className="text-sm font-medium leading-none mb-1">
                                  {activity.title}
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {activity.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
