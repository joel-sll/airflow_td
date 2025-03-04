

// // document.addEventListener("DOMContentLoaded", function () {
// //     console.log("🔧 Hiding all ToC content...");

// //     // Select and hide all ToC items inside the primary sidebar
// //     document.querySelectorAll("body > div.md-container > main > div > div.md-sidebar.md-sidebar--primary nav ul li").forEach((item) => {
// //         item.style.display = "none";
// //     });

// document.addEventListener("DOMContentLoaded", function () {
//     const headers = document.querySelectorAll("h2, h3, h4"); // Select all subheadings
//     if (headers.length === 0) return;

//     // Create the floating ToC container
//     const tocContainer = document.createElement("div");
//     tocContainer.classList.add("floating-toc");
//     tocContainer.innerHTML = `<h2>On this page</h2><ul>`;

//     headers.forEach(header => {
//         const id = header.id || header.textContent.toLowerCase().replace(/\s+/g, "-");
//         header.id = id;

//         const level = header.tagName.toLowerCase();
//         const indent = level === "h2" ? "" : level === "h3" ? "&nbsp;&nbsp;&nbsp;" : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

//         tocContainer.innerHTML += `<li>${indent}<a href="#${id}">${header.textContent}</a></li>`;
//     });

//     tocContainer.innerHTML += "</ul>";
//     document.body.appendChild(tocContainer);
// });

document.addEventListener("DOMContentLoaded", function () {
    function createTocContainer() {
        if (!document.querySelector(".floating-toc")) {
            const tocContainer = document.createElement("div");
            tocContainer.classList.add("floating-toc");
            tocContainer.innerHTML = "<h2>On this page</h2><ul></ul>"; // Empty list initially
            document.body.appendChild(tocContainer);
        }
    }

    // function getActiveTabContent() {
    //     // Select the first tabbed-block that is NOT hidden
    //     return [...document.querySelectorAll(".md-typeset .tabbed-block")]
    //         .find(tab => getComputedStyle(tab).display !== "none") || null;
    // }
    
    function getActiveTabContent() {
        let activeTab = [...document.querySelectorAll(".md-typeset .tabbed-block")]
            .find(tab => getComputedStyle(tab).display !== "none");
    
        // If no tabs exist, return the main content area
        return activeTab || document.querySelector(".md-content") || null;
    }
    
    
    function updateSecondaryToc() {
        createTocContainer();
        const tocContainer = document.querySelector(".floating-toc");
        const tocList = tocContainer.querySelector("ul");
        tocList.innerHTML = ""; // Clear old entries
    
        const activeTab = getActiveTabContent();
        if (!activeTab) {
            console.warn("⚠ No active tab found!");
            return;
        }
    
        const headers = activeTab.querySelectorAll("h2, h3, h4"); // Get headers from active tab only
        if (headers.length === 0) {
            tocList.innerHTML = "<li><em>No content available</em></li>";
            return;
        }
    
        headers.forEach(header => {
            let text = header.textContent.replace("¶", "").trim(); // Remove pilcrow (¶)
            const id = header.id || text.toLowerCase().replace(/\s+/g, "-");
            header.id = id;
    
            const listItem = document.createElement("li");
            listItem.innerHTML = `<a href="#${id}">${text}</a>`; // Use cleaned text
            tocList.appendChild(listItem);
        });
    }
    
    // Run on page load & when tab switches
    document.addEventListener("DOMContentLoaded", updateSecondaryToc);
    document.addEventListener("click", function (event) {
        if (event.target.closest(".tabbed-labels .tabbed-label")) {
            console.log("🖱 Tab Clicked! Updating TOC...");
            setTimeout(updateSecondaryToc, 100); // Delay to allow tab switch
        }
    });
    
    
    

    // Run once on page load
    createTocContainer();
    updateSecondaryToc();

    // Update ToC when tabs switch
    document.addEventListener("click", function (event) {
        if (event.target.closest(".md-tabs__link, .md-typeset .tabbed-labels")) {
            setTimeout(updateSecondaryToc, 100); // Wait for tab switch
        }
    });
});
