import * as React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  Grid3x3,
  FileText,
  Zap,
  Users,
  BookOpen,
} from "lucide-react";

export default function Home() {
  const activities = [
    {
      id: "cruzadinha",
      title: "Gerador de Cruzadinhas",
      description:
        "Crie cruzadinhas personalizadas com palavras e dicas. Perfeito para atividades educativas.",
      icon: Grid3x3,
      path: "/cruzadinha",
      color: "from-blue-600 to-purple-600",
      bgColor: "from-blue-50 to-purple-50",
      iconColor: "text-blue-600",
      features: [
        "Modo Manual e IA",
        "PDF com respostas",
        "Temas educativos",
        "Até 20 palavras",
      ],
    },
    {
      id: "caca-palavras",
      title: "Gerador de Caça-Palavras",
      description:
        "Crie caça-palavras envolventes e desafiadores. Ideal para exercitar o vocabulário.",
      icon: Search,
      path: "/caca-palavras",
      color: "from-emerald-600 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
      features: [
        "Palavras em todas direções",
        "Grade customizável",
        "Banco de palavras IA",
        "Até 25 palavras",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent mb-6">
            Gerador de Atividades Educativas
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Crie atividades educativas personalizadas de forma rápida e fácil.
            Ferramentas inteligentes para professores e educadores.
          </p>

          <div className="flex justify-center items-center gap-4 mb-8">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              IA Integrada
            </Badge>
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Para Educadores
            </Badge>
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm bg-green-100 text-green-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Badge>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Atividades Disponíveis
            </h2>
            <p className="text-gray-600">
              Escolha a atividade que deseja criar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {activities.map((activity) => {
              const IconComponent = activity.icon;

              return (
                <Card
                  key={activity.id}
                  className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 overflow-hidden"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${activity.color}`}
                  ></div>

                  <CardHeader
                    className={`bg-gradient-to-br ${activity.bgColor} pb-4`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl bg-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent
                          className={`w-8 h-8 ${activity.iconColor}`}
                        />
                      </div>
                      <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors duration-300" />
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                      {activity.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 bg-white">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {activity.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                        Características:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {activity.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${activity.color} mr-2`}
                            ></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link to={activity.path} className="block w-full">
                      <Button
                        className={`w-full bg-gradient-to-r ${activity.color} hover:opacity-90 shadow-lg hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 text-white font-semibold py-3`}
                      >
                        <IconComponent className="w-5 h-5 mr-2" />
                        Criar {activity.title.split(" ")[2]}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Por que usar nossos geradores?
              </h3>
              <p className="text-gray-600">
                Ferramentas desenvolvidas especialmente para educadores
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  IA Inteligente
                </h4>
                <p className="text-gray-600 text-sm">
                  Geração automática de palavras por tema e dificuldade
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Export PDF</h4>
                <p className="text-gray-600 text-sm">
                  Baixe suas atividades em PDF com ou sem respostas
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Para Educadores
                </h4>
                <p className="text-gray-600 text-sm">
                  Interface intuitiva pensada para professores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
