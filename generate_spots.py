import re

with open('conditions.html', 'r', encoding='utf-8') as f:
    template = f.read()

spots = [
    {
        'filename': 'hossegor.html',
        'title': 'Ultra Forecast & Conditions | Hossegor',
        'location': 'Hossegor, France',
        'break_name': 'La Gravière'
    },
    {
        'filename': 'biarritz.html',
        'title': 'Ultra Forecast & Conditions | Biarritz',
        'location': 'Biarritz, France',
        'break_name': 'Côte des Basques'
    },
    {
        'filename': 'latorche.html',
        'title': 'Ultra Forecast & Conditions | La Torche',
        'location': 'La Torche, France',
        'break_name': 'Pointe de la Torche'
    },
    {
        'filename': 'seignosse.html',
        'title': 'Ultra Forecast & Conditions | Seignosse',
        'location': 'Seignosse, France',
        'break_name': 'Les Estagnots'
    }
]

for spot in spots:
    content = template
    # Replace the <title> tag
    content = re.sub(r'<title>.*?</title>', f"<title>{spot['title']}</title>", content)
    # Replace 'North Shore, Oahu'
    content = re.sub(r'<h2 class="text-white text-3xl md:text-4xl font-black tracking-tight flex items-center">.*?</h2>', 
                     f'<h2 class="text-white text-3xl md:text-4xl font-black tracking-tight flex items-center">{spot["location"]}</h2>', content)
    # Replace 'Banzai Pipeline' before ' • Last updated'
    content = re.sub(r'([ \t\n]+)([\w\s\'\-]+)( • Last updated)', r'\g<1>' + spot['break_name'] + r'\g<3>', content)
    
    with open(spot['filename'], 'w', encoding='utf-8') as f:
        f.write(content)

print("Spots generated successfully.")
