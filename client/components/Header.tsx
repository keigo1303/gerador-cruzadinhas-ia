import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  Grid3x3,
  Search,
  Sparkles,
  ChevronDown,
  Hash,
  Trophy,
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
      icon: Trophy,
      path: "/bingo-palavras",
      color: "text-purple-600",
    },
    {
      title: "Gerador de Sudoku",
      description: "Crie puzzles de Sudoku com diferentes dificuldades",
      icon: Hash,
      path: "/sudoku",
      color: "text-indigo-600",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Atividades
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[320px] md:w-[380px]"
              >
                {activities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <DropdownMenuItem key={activity.path} asChild>
                      <Link
                        to={activity.path}
                        className="flex items-center gap-3 p-3 cursor-pointer"
                      >
                        <Icon className={`w-5 h-5 ${activity.color}`} />
                        <div>
                          <div className="text-sm font-medium leading-none mb-1">
                            {activity.title}
                          </div>
                          <p className="text-xs leading-snug text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
