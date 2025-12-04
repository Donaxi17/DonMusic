import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 md:px-8">
      <div class="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Política de Privacidad</h1>
        
        <div class="space-y-6 text-sm md:text-base leading-relaxed">
          <p>Última actualización: Diciembre 2025</p>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">1. Introducción</h2>
            <p>Bienvenido a DonMusica. Respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio web.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">2. Datos que Recopilamos</h2>
            <p>Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales, que incluyen:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Datos de Identidad: nombre de usuario (si se registra).</li>
              <li>Datos de Contacto: dirección de correo electrónico (si se suscribe o contacta).</li>
              <li>Datos Técnicos: dirección IP, tipo de navegador, sistema operativo.</li>
              <li>Datos de Uso: información sobre cómo usa nuestro sitio web y servicios.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">3. Cookies y Publicidad (AdSense)</h2>
            <p>Utilizamos cookies para mejorar su experiencia. Además, utilizamos Google AdSense para mostrar anuncios. Google utiliza cookies para mostrar anuncios basados en sus visitas anteriores a este u otros sitios web.</p>
            <p class="mt-2">Los usuarios pueden inhabilitar la publicidad personalizada visitando la <a href="https://www.google.com/settings/ads" target="_blank" class="text-emerald-400 hover:underline">Configuración de Anuncios de Google</a>.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">4. Uso de sus Datos</h2>
            <p>Solo utilizaremos sus datos personales cuando la ley lo permita. Principalmente para:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Ofrecerle nuestros servicios musicales.</li>
              <li>Mejorar nuestro sitio web y experiencia de usuario.</li>
              <li>Mostrar publicidad relevante.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">5. Contacto</h2>
            <p>Si tiene preguntas sobre esta política de privacidad, contáctenos en: <a href="mailto:contacto&#64;donmusica.com" class="text-emerald-400 hover:underline">contacto&#64;donmusica.com</a></p>
          </section>
        </div>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent { }
