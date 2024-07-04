let city = document.querySelector('.current_city');
let day = document.querySelector('.current_day');
let date = document.querySelector('.current_date');
let month = document.querySelector('.current_month');
let temp = document.querySelector('.current_temp');

const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
let monthObj = new Date();
let dayObj = new Date();
let dateObj = new Date();
let currentTimeObj = new Date();

function updateDateTime() {
    day.innerHTML = days[currentTimeObj.getDay()] + ',';
    date.innerHTML = currentTimeObj.getDate() + ' - ';
    month.innerHTML = months[currentTimeObj.getMonth()];
}

updateDateTime();
setInterval(updateDateTime, 60000);

let regionBtns = document.querySelectorAll('.region_button');
const APIKey = 'fb76a7eb4c37afebd2acce3ff60ddea3';

function weatherData(json) {
    const image = document.querySelector('.current_info-pic img');
    const temp = document.querySelector('.current_temp');

    switch (json.weather[0].main) {
        case 'Clear':
            image.src = 'assets/clear.svg';
            break;

        case 'Rain':
            image.src = 'assets/rain.svg';
            break;

        case 'Snow':
            image.src = 'assets/snow.svg';
            break;

        case 'Clouds':
            image.src = 'assets/cloud.svg';
            break;

        case 'Mist':
            image.src = 'assets/mist.svg';
            break;

        case 'Haze':
            image.src = 'assets/mist.svg';
            break;

        default:
            image.src = 'assets/clear.svg';
    }

    temp.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    city.innerHTML = json.name;  
}

function getHourlyImage(weatherMain) {
    switch (weatherMain) {
        case 'Clear':
            return 'assets/clear.svg';
        case 'Rain':
            return 'assets/rain.svg';
        case 'Snow':
            return 'assets/snow.svg';
        case 'Clouds':
            return 'assets/cloud.svg';
        case 'Mist':
        case 'Haze':
            return 'assets/mist.svg';
        default:
            return 'assets/clear.svg';
    }
}

function showHourlyForecast(selectedRegion) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${selectedRegion}&units=metric&appid=${APIKey}`)
        .then((res) => res.json())
        .then(json => {

            const currentWeather = {
                time: 'Now',
                temp: parseInt(json.list[1].main.temp),
                imageSrc: getHourlyImage(json.list[0].weather[0].main)
            };

            const currentTime = new Date();
            const currentHour = currentTime.getHours();

            const hourlyData = json.list.slice(0, 8).map((item, index) => {
                const nextHour = (currentHour + index * 3) % 24;
                return {
                    time: index === 0 ? 'Now' : `${nextHour}:00`,
                    temp: parseInt(item.main.temp),
                    imageSrc: getHourlyImage(item.weather[0].main)
                };
            });

            updateHourlyForecast(hourlyData, currentWeather);
        });
}

function updateHourlyForecast(hourlyData) {
    const hourlyForecastElement = document.querySelector('.hourly-forecast');

    hourlyForecastElement.innerHTML = '';

    hourlyData.forEach(hour => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');

        hourlyItem.innerHTML = `
            <p class="hourly-time">${hour.time}</p>
            <img class="hourly-image" src="${hour.imageSrc}">
            <p class="hourly-temp">${hour.temp}<span>°C</span></p>
        `;

        hourlyForecastElement.appendChild(hourlyItem);
    });
}


function showDailyForecast(selectedRegion) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${selectedRegion}&units=metric&appid=${APIKey}`)
        .then((res) => res.json())
        .then(json => {

            const dailyData = json.list.filter(item => item.dt_txt.includes('12:00')).slice(0, 8).map(item => {
                return {
                    day: days[new Date(item.dt_txt).getDay()],
                    date: new Date(item.dt_txt).getDate(),
                    temp: parseInt(item.main.temp),
                    imageSrc: getHourlyImage(item.weather[0].main)
                };
            });

            updateDailyForecast(dailyData);
        });
}

function updateDailyForecast(dailyData) {
    const dailyForecastElement = document.querySelector('.daily-forecast');

    dailyForecastElement.innerHTML = '';

    dailyData.forEach(day => {
        const dailyItem = document.createElement('div');
        dailyItem.classList.add('daily-item');

        dailyItem.innerHTML = `
            <div style="display: flex">
                <p class="daily-day" style="margin-right: 5px;">${day.day + ','}</p>
                <p class="daily-date">${day.date}</p>
            </div>
            <div style="display: flex">
                <img class="daily-image" src="${day.imageSrc}" style="margin-right: 10px;">
                <p class="daily-temp">${day.temp}<span>°C</span></p>
            </div>
        `;

        dailyForecastElement.appendChild(dailyItem);
    });

}


function DefaultWeather() {
    const defaultCity = 'Tashkent';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&units=metric&appid=${APIKey}`)
        .then((res) => res.json())
        .then(json => {
            weatherData(json);
            showHourlyForecast(defaultCity);
            showDailyForecast(defaultCity);
        });
}

DefaultWeather();

regionBtns.forEach(button => {
    button.addEventListener('click', () => {
        const selectedRegion = button.getAttribute('data-region');

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${selectedRegion}&units=metric&appid=${APIKey}`)
            .then((res) => res.json())
            .then(json => {
                weatherData(json);
                showHourlyForecast(selectedRegion);
                showDailyForecast(selectedRegion);
            });
    });
});
