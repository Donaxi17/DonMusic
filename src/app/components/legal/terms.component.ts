import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 md:px-8">
      <div class="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Términos y Condiciones</h1>
        
        <div class="space-y-6 text-sm md:text-base leading-relaxed">
          <p>Última actualización: Diciembre 2025</p>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar DonMusica, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">2. Propiedad Intelectual</h2>
            <p>El servicio y su contenido original (excluyendo el contenido proporcionado por los usuarios y artistas), características y funcionalidad son y seguirán siendo propiedad exclusiva de DonMusica y sus licenciantes.</p>
            <p class="mt-2">La música disponible en la plataforma pertenece a sus respectivos dueños y artistas. DonMusica actúa como plataforma de distribución y promoción.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">3. Uso del Servicio</h2>
            <p>Usted se compromete a no utilizar el servicio para:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Violar cualquier ley nacional o internacional.</li>
              <li>Infringir los derechos de propiedad intelectual de otros.</li>
              <li>Distribuir malware o virus.</li>
              <li>Recopilar datos de otros usuarios sin su consentimiento.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">4. Limitación de Responsabilidad</h2>
            <p>En ningún caso DonMusica, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">5. Cambios</h2>
            <p>Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Es su responsabilidad revisar estos Términos periódicamente.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-emerald-400 mb-3">6. Contacto</h2>
            <p>Si tiene alguna pregunta sobre estos Términos, contáctenos en: <a href="mailto:contacto&#64;donmusica.com" class="text-emerald-400 hover:underline">contacto&#64;donmusica.com</a></p>
          </section>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent { }
