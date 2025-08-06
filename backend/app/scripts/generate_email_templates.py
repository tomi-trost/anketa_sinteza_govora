import csv
import os

input_csv = os.path.join(os.path.dirname(__file__), "../../exports/survey_export.csv")
output_path = os.path.join(os.path.dirname(__file__), "../../exports/emails")
combined_file = os.path.join(output_path, "combined.txt")

# Ensure output directory exists
os.makedirs(output_path, exist_ok=True)

# Template for the message
def generate_message(email, score1, score2, score3, score4, total):
    return f"""*** ({email})

Dragi anketiranec, draga anketiranka,

hvala, ker si izpolnil/a ANKETO o RAZLOČEVANJU med naravnim in sintetiziranim govorom v slovenščini.

REZULTATI tvojega izpolnjevanja so:
glas 1 {score1} %
glas 2 {score2} %
glas 3 {score3} %
glas 4 {score4} %
skupni rezultat {total} %

(Kot pravilen odgovor velja vnos "gotovo sintetizirano " ali "verjetno sintetizirano" za sintetiziran posnetek oziroma "verjetno naravno " ali "gotovo naravno" za naraven posnetek. Število pravilnih odgovorov je deljeno s številom vseh posnetkov, rezultat je izražen v odstotkih.)

Če želiš k izpolnjevanju (upamo, da ni bilo duhamorno :) povabiti še koga, bomo veseli deljenja. Anketa bo odprta do 26. avgusta.
https://anketa.true-bar.si

V oktobru, ko bo raziskava končana, bomo poslali rezultate in besedilo celotne raziskave.

Vabljen/a tudi na simpozij GOVOR. GLAS. IDENTITETA. na UL AGRFT, 29. in 30. septembra ter 1. oktobra 2025.
https://www.agrft.uni-lj.si/blog/2025/01/26/govor-glas-identiteta/

Hvala in vse dobro,

Jure Longyka

Še uporabnih povezav za deljenje:

https://novinar.com/novica/vabljeni-k-sodelovanju-pri-raziskavi-o-razlocevanju-med-naravnim-sintetiziranim-govorom-v-slovenscini/

https://www.linkedin.com/posts/drustvo-novinarjev-slovenije_vabljeni-k-sodelovanju-pri-raziskavi-o-razlo%C4%8Devanju-activity-7354081631873171456-ZXiM/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAMec2QB1fCaETqfAx65SSnzjwPSMvF3LuQ

https://www.sigic.si/ali-znate-prepoznati-naravni-govor-od-sintetiziranega-.html

https://www.facebook.com/izstekani/posts/pfbid0kesDsby1SpwwXHfLFomSwWC5fdAwGKZQ12RWBteSnGJqNKhwo8hEzGspka8hWkm8l
"""

# Keep track of all messages for combined.txt
all_messages = []

with open(input_csv, encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        email = row.get("email", "").strip()
        if not email or email == "-99":
            continue

        # Read scores safely
        def percent(score):
            try:
                return f"{round(float(score) * 100, 1)}"
            except:
                return "0"

        score1 = percent(row.get("score_Klemen", 0))
        score2 = percent(row.get("score_Nataša", 0))
        score3 = percent(row.get("score_Jure", 0))
        score4 = percent(row.get("score_Žiga", 0))
        total  = percent(row.get("score_total", 0))

        message = generate_message(email, score1, score2, score3, score4, total)
        all_messages.append(message)

        # Write individual txt file
        safe_filename = email.replace("@", "_at_").replace(".", "_")
        file_path = os.path.join(output_path, f"{safe_filename}.txt")
        with open(file_path, "w", encoding='utf-8') as out_file:
            out_file.write(message)

# Write combined.txt
with open(combined_file, "w", encoding='utf-8') as combined_out:
    combined_out.write("\n----------\n".join(all_messages))
