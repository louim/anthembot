# Download all the countries anthem with curl
# curl -JLO --referer http://www.download-midi.com http://www.download-midi.com/files/download/[8892-9026]
require 'countries/global'

Dir.foreach('media') do |item|
  next if item == '.' or item == '..'
  country = item.gsub('National Anthem - ', '').gsub('.mid', '')
  iso3166_country = ISO3166::Country.find_country_by_name(country)
  if iso3166_country
    File.rename("media/#{item}", "media/#{iso3166_country.alpha2.downcase}.mid")
  else
    p "#{country} not found"
  end
end
