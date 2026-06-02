// src/pages/Contato.jsx
import { useConfiguracoes } from '../hooks/useConfiguracoes'
import { useHorarios } from '../hooks/useHorarios'
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'

function getDiaSemanaAtual() {
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  return dias[new Date().getDay()]
}

function formatarHorario(horario) {
  if (!horario || !horario.aberto) return 'Fechado'
  return `${horario.abertura || horario.abre} às ${horario.fechamento || horario.fecha}`
}

export default function Contato() {
  const { config } = useConfiguracoes()
  const { horarios, carregando } = useHorarios()
  
  const diaAtual = getDiaSemanaAtual()
  const horarioHoje = horarios?.[diaAtual]

  // Mapeamento dos dias da semana para exibição
  const diasSemana = [
    { key: 'segunda', nome: 'Segunda-feira' },
    { key: 'terca', nome: 'Terça-feira' },
    { key: 'quarta', nome: 'Quarta-feira' },
    { key: 'quinta', nome: 'Quinta-feira' },
    { key: 'sexta', nome: 'Sexta-feira' },
    { key: 'sabado', nome: 'Sábado' },
    { key: 'domingo', nome: 'Domingo' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-700 mb-1">📍 Onde Estamos</h1>
      <p className="text-gray-500 mb-8">Venha nos visitar ou fale com a gente!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações */}
        <div className="space-y-4">
          {/* Endereço */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg text-green-700 mb-4 flex items-center gap-2">
              <BuildingStorefrontIcon className="w-5 h-5" />
              Informações
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">{config?.endereco || 'Rua Herculano Silva, 148'}</p>
                  <p className="text-gray-500 text-sm">Centro · Monte Formoso – MG</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">{config?.telefone || '(33) 98827-0853'}</p>
                  <p className="text-gray-500 text-sm">Telefone e WhatsApp</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <BuildingStorefrontIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">CNPJ: 01.971.403/0001-40</p>
                  <p className="text-gray-500 text-sm">Mercearia Esquinão do Ba</p>
                </div>
              </div>
            </div>

            {/* Botão WhatsApp */}
            <a
              href={`https://wa.me/${config?.whatsapp?.replace(/\D/g, '') || '5533987270853'}?text=Olá! Vim pelo site do Esquinão do Bá 😊`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow"
            >
              <FaWhatsapp className="w-5 h-5" />
              Chamar no WhatsApp
            </a>

            {/* Redes sociais */}
            {(config?.instagram || config?.facebook) && (
              <div className="mt-3 flex gap-2">
                {config?.instagram && (
                  <a
                    href={`https://instagram.com/${config.instagram.replace('https://instagram.com/', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold py-2 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-1"
                  >
                    <FaInstagram className="w-4 h-4" />
                    Instagram 
                  </a>
                )}
                {/* {config?.facebook && (
                  <a
                    href={`https://facebook.com/${config.facebook.replace('https://facebook.com/', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-blue-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <FaFacebook className="w-4 h-4" />
                    Facebook
                  </a>
                )} */}
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg text-green-700 mb-3 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Localização
            </h2>
            <div className="bg-green-50 rounded-xl h-48 flex flex-col items-center justify-center gap-2 text-center border-2 border-dashed border-green-200">
              <span className="text-4xl">🗺️</span>
              <p className="font-bold text-green-700">Monte Formoso – MG</p>
              <p className="text-sm text-gray-500">{config?.endereco || 'Rua Herculano Silva, 148 – Centro'}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(config?.endereco || 'Rua Herculano Silva 148 Monte Formoso MG')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-xs font-bold text-green-600 hover:underline"
              >
                Abrir no Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* Horários */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-fit">
          <h2 className="font-bold text-lg text-green-700 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Horário de Funcionamento
          </h2>
          
          {carregando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando horários...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {diasSemana.map((dia) => {
                const horario = horarios?.[dia.key]
                const isHoje = dia.key === diaAtual
                const estaAberto = horario?.aberto === true
                
                return (
                  <div
                    key={dia.key}
                    className={`flex justify-between items-center py-2.5 px-3 rounded-xl text-sm transition-all ${
                      isHoje
                        ? 'bg-green-50 border border-green-200 font-bold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={isHoje ? 'text-green-700 font-bold' : 'text-gray-700'}>
                      {dia.nome}
                      {isHoje && (
                        <span className="ml-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                          Hoje
                        </span>
                      )}
                    </span>
                    {estaAberto ? (
                      <span className="text-green-600 font-bold">
                        {horario.abertura || horario.abre} às {horario.fechamento || horario.fecha}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold">Fechado</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Status atual */}
          {!carregando && horarioHoje && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              horarioHoje.aberto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <p className="text-sm font-bold">
                {horarioHoje.aberto 
                  ? `🟢 Aberto agora - Fecha às ${horarioHoje.fechamento || horarioHoje.fecha}`
                  : `🔴 Fechado agora - Abre ${formatarHorario(horarios?.proximoAberto || horarioHoje)}`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}