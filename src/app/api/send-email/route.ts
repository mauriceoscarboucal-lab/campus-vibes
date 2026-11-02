import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, nom, type, rubrique } = body;

    let subject = "";
    let html = "";
    let couleurTitre = "#EAB308";

    // 1. PARTICIPATION ÉMISSION (Inscription)
        if (type === "participation") {
      subject = "Ta candidature pour USSEIN 360 est bien reçue !";
      html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #EAB308;">Salut ${nom} !</h2>
          <p>Nous avons bien reçu ta candidature pour participer à l'émission <strong>USSEIN 360</strong>.</p>
          <p>Notre équipe étudie toutes les propositions avec attention. <strong>Si tu es sélectionné(e), tu recevras un second email avec les détails pratiques.</strong></p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">📌 Une question ? Contacte-nous :</h3>
            <p>📧 Email : <strong>ussein360fatick@gmail.com</strong></p>
            <p>📞 WhatsApp : <strong>77 901 53 64</strong></p>
          </div>

          <p>À très vite sur le plateau !</p>
          <p style="font-weight: bold; color: #EAB308;">L'équipe USSEIN 360</p>
        </div>
      `;
    } 
    // 2. SÉLECTIONNÉ (Admin)
        else if (type === "selection") {
      subject = "🎉 Félicitations ! Tu es sélectionné(e) pour USSEIN 360 !";
      html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #16A34A;">Félicitations ${nom} ! 🎉</h2>
          <p>Nous avons le plaisir de t'annoncer que ta candidature a été <strong>retenue</strong> pour participer à la prochaine émission <strong>USSEIN 360</strong>.</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #16A34A; padding: 15px; margin: 20px 0;">
  <h3 style="margin-top: 0; color: #16A34A;">🎯 Ta participation :</h3>
  <p style="font-size: 16px; font-weight: bold; margin-bottom: 0;">${rubrique || "Participation à l'émission"}</p>
</div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">📌 Informations importantes :</h3>
            <ul style="padding-left: 20px;">
              <li>Merci de te présenter <strong>1 heure avant le début de l'émission</strong>.</li>
              <li>Pour toute question ou pour confirmer ta présence, tu peux nous contacter :</li>
            </ul>
            <p>📧 Email : <strong>ussein360fatick@gmail.com</strong></p>
            <p>📞 WhatsApp : <strong>77 901 53 64</strong></p>
          </div>

          <p>Prépare-toi, on a hâte de t'accueillir sur le plateau !</p>
          <p style="font-weight: bold; color: #16A34A;">L'équipe USSEIN 360</p>
        </div>
      `;
    }
    // 3. QUESTIONS
    else if (type === "question") {
      subject = "Ta question pour le campus a bien été reçue - USSEIN 360";
      couleurTitre = "#3B82F6";
      html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2 style="color: ${couleurTitre};">Merci ${nom} !</h2><p>Nous avons bien reçu ta question. Si elle est retenue, elle sera posée en direct pendant l'émission.</p><p style="font-weight: bold; color: ${couleurTitre};">L'équipe USSEIN 360</p></div>`;
    }
    // 4. JEUX
    else if (type === "jeu") {
      subject = "Inscription validée au jeu USSEIN 360 !";
      couleurTitre = "#8B5CF6";
      html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2 style="color: ${couleurTitre};">C'est noté ${nom} !</h2><p>Ton inscription pour le jeu est bien enregistrée. Prépare-toi, on te contactera pour te donner les consignes !</p><p style="font-weight: bold; color: ${couleurTitre};">L'équipe USSEIN 360</p></div>`;
    }
    // 5. SUJETS
    else if (type === "sujet") {
      subject = "Ton sujet de débat a bien été reçu - USSEIN 360";
      couleurTitre = "#F97316";
      html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2 style="color: ${couleurTitre};">Merci ${nom} !</h2><p>Merci d'avoir proposé ce sujet. Notre équipe étudie toutes les propositions pour les prochains débats.</p><p style="font-weight: bold; color: ${couleurTitre};">L'équipe USSEIN 360</p></div>`;
    }
    // 6. TALENTS
    else if (type === "talent") {
      subject = "Candidature Talent bien reçue - USSEIN 360";
      couleurTitre = "#EC4899";
      html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2 style="color: ${couleurTitre};">Quel talent ${nom} !</h2><p>Nous avons bien reçu ta proposition de talent. Si ton profil est retenu, nous te contacterons très vite.</p><p style="font-weight: bold; color: ${couleurTitre};">L'équipe USSEIN 360</p></div>`;
    }
    else {
      return NextResponse.json({ error: "Type inconnu" }, { status: 400 });
    }

    // Appel à l'API Brevo (et non plus Resend)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
        "content-type": "application/json",
      },
            body: JSON.stringify({
        sender: { 
          name: "USSEIN 360", 
          email: process.env.BREVO_SENDER_EMAIL 
        },
        // 👇 Ajoute cette ligne pour le logo
        headers: {
          "X-Mailin-Tag": "USSEIN360", // Optionnel, pour le suivi
          "X-Mailin-custom": "logo", 
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur Brevo:", errorData);
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}