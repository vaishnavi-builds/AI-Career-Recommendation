let careerData = null;


let preferences = {};

// LOAD JSON
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        careerData = data;
        populateEducationSuggestions();
    });
function populateEducationSuggestions() {
    const list = document.getElementById("education-list");

    careerData.education_levels.forEach(edu => {
        const option = document.createElement("option");
        option.value = edu;
        list.appendChild(option);
    });
}
/* =========================
   TAG INPUT (SKILLS / INTERESTS)
========================= */

function setupTagInput(type) {
    const input = document.getElementById(`${type}-input`);
    const container = document.getElementById(`${type}-tags`);

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = input.value.trim();

            if (value !== "") {
                addTag(type, value);
                input.value = "";
            }
        }
    });
}

function addTag(type, text) {
    const container = document.getElementById(`${type}-tags`);

    const tag = document.createElement("span");
    tag.className = "tag";

    tag.innerHTML = `
        ${text}
        <button onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(tag);
}

function addQuickTag(type, value) {
    addTag(type, value);
}

function getTags(type) {
    const tags = document.querySelectorAll(`#${type}-tags .tag`);
    return Array.from(tags).map(tag =>
        tag.childNodes[0].textContent.trim()
    );
}

/* =========================
   EDUCATION INPUT
========================= */

function getEducation() {
    const edu = document.getElementById("education-input");
    if (!edu) return "";
    return edu.value.trim();
}

/* =========================
   WORK STYLE
========================= */

function selectPref(btn) {
    const group = btn.dataset.group;
    const value = btn.dataset.value;

    document
        .querySelectorAll(`[data-group="${group}"]`)
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    preferences[group] = value;
}

/* =========================
   SCORE CALCULATION
========================= */

function calculateScore(career, skills, interests, education) {
    let score = 0;

    // Skill matching (HIGH weight)
    career.required_skills.forEach(skill => {
        skills.forEach(userSkill => {
            if (userSkill.toLowerCase().includes(skill.toLowerCase())) {
                score += 8;
            }
        });
    });

    // Interest matching (medium weight)
    career.matching_interests.forEach(interest => {
        interests.forEach(userInterest => {
            if (userInterest.toLowerCase().includes(interest.toLowerCase())) {
                score += 5;
            }
        });
    });

    // Education matching (boost)
    if (career.suitable_education.includes(education)) {
        score += 15;
    }

    // Work style matching (AI behaviour)
    if (career.work_style) {
        Object.values(preferences).forEach(pref => {
            if (career.work_style.includes(pref)) {
                score += 3;
            }
        });
    }

    return score;
}

/* =========================
   GENERATE RECOMMENDATIONS
========================= */

function generateRecommendations() {

    if (!careerData) {
        alert("Data not loaded yet");
        return;
    }

    const skills = getTags("skills");
    const interests = getTags("interests");
    const education = getEducation();

    if (skills.length === 0 || interests.length === 0 || education === "") {
        alert("Please fill skills, interests and education");
        return;
    }

    let results = careerData.careers.map(career => {
        return {
            ...career,
            score: calculateScore(career, skills, interests, education)
        };
    });

    results.sort((a, b) => b.score - a.score);

    showResults(results.slice(0, 5));
}

/* =========================
   SHOW RESULTS
========================= */

function showResults(results) {

    const container = document.getElementById("careers-grid");
    const section = document.getElementById("results-section");

    container.innerHTML = "";

    results.forEach((career, index) => {

        const card = document.createElement("div");
        card.className = "career-card";

        card.innerHTML = `
      <div class="career-header">
        <span class="career-rank">#${index + 1}</span>
<span class="match-score">${career.score}% Match</span>
        <h3>${career.career_name}</h3>
      </div>

      <p class="career-desc">${career.description}</p>

      <div class="career-meta">
        <div class="meta-box">
          <span>💰 Salary</span>
          <strong>${career.average_salary_range_inr}</strong>
        </div>

        <div class="meta-box">
          <span>📈 Growth</span>
          <strong>${career.market_growth}</strong>
        </div>
      </div>

      <div class="career-section">
        <h4>🎯 Required Skills</h4>
        <div class="skill-tags">
          ${career.required_skills
                .slice(0, 6)
                .map(skill => `<span>${skill}</span>`)
                .join("")}
        </div>
      </div>

      <div class="career-section">
        <h4>📚 Recommended Courses</h4>
        <ul class="course-list">
          ${career.recommended_courses
                .map(course => `
              <li>
                <a href="${course.url}" target="_blank">
                  ${course.course_name}
                </a>
                <span>${course.platform}</span>
              </li>
            `).join("")}
        </ul>
      </div>

      <div class="career-section">
        <h4>🚀 Future Scope</h4>
        <p>${career.future_scope}</p>
      </div>
    `;

        container.appendChild(card);
    });

    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
}
/* =========================
   INIT
========================= */

setupTagInput("skills");
setupTagInput("interests");