// document.addEventListener("DOMContentLoaded", function () {
//     function createTocContainer() {
//         if (!document.querySelector(".floating-toc")) {
//             const tocContainer = document.createElement("div");
//             tocContainer.classList.add("floating-toc");
//             tocContainer.innerHTML = "<h2>On this page</h2><ul></ul>"; // Empty list initially
//             document.body.appendChild(tocContainer);
//         }
//     }

//     function getActiveTabContent() {
//         let activeTab = [...document.querySelectorAll(".md-typeset .tabbed-block")]
//             .find(tab => getComputedStyle(tab).display !== "none");
    
//         // If no tabs exist, return the main content area
//         return activeTab || document.querySelector(".md-content") || null;
//     }

//     function updateSecondaryToc() {
//         createTocContainer();
//         const tocContainer = document.querySelector(".floating-toc");
//         const tocList = tocContainer.querySelector("ul");
//         tocList.innerHTML = ""; // Clear old entries
    
//         const activeTab = getActiveTabContent();
//         if (!activeTab) {
//             console.warn("⚠ No active tab found!");
//             return;
//         }
    
//         const headers = activeTab.querySelectorAll("h2, h3"); // Get headers from active tab only
//         if (headers.length === 0) {
//             tocList.innerHTML = "<li><em>No content available</em></li>";
//             return;
//         }
    
//         headers.forEach(header => {
//             let text = header.textContent.replace("¶", "").trim(); // Remove pilcrow (¶)
//             const id = header.id || text.toLowerCase().replace(/\s+/g, "-");
//             header.id = id;
    
//             const listItem = document.createElement("li");
//             listItem.innerHTML = `<a href="#${id}">${text}</a>`; // Use cleaned text
//             tocList.appendChild(listItem);
//         });
//     }
    
//     // Run on page load & when tab switches
//     document.addEventListener("DOMContentLoaded", updateSecondaryToc);
//     document.addEventListener("click", function (event) {
//         if (event.target.closest(".tabbed-labels .tabbed-label")) {
//             console.log("🖱 Tab Clicked! Updating TOC...");
//             setTimeout(updateSecondaryToc, 100); // Delay to allow tab switch
//         }
//     });
    
//     // Run once on page load
//     createTocContainer();
//     updateSecondaryToc();

//     // Update ToC when tabs switch
//     document.addEventListener("click", function (event) {
//         if (event.target.closest(".md-tabs__link, .md-typeset .tabbed-labels")) {
//             setTimeout(updateSecondaryToc, 100); // Wait for tab switch
//         }
//     });
// });


document.addEventListener("DOMContentLoaded", function () {
    // Check if the page should have a secondary TOC
    function shouldAddSecondaryToc() {
        const firstH1 = document.querySelector("h1");
        
        // Check if the first <h1> is "Overview"
        if (firstH1 && firstH1.textContent.trim() === "Overview") {
            return false; // Don't add the secondary TOC on the Overview page
        }
        
        return true; // Otherwise, add the secondary TOC
    }

    function createTocContainer() {
        if (!document.querySelector(".floating-toc")) {
            const tocContainer = document.createElement("div");
            tocContainer.classList.add("floating-toc");
            tocContainer.innerHTML = "<h2>On this page</h2><ul></ul>"; // Empty list initially
            document.body.appendChild(tocContainer);
        }
    }

    function getActiveTabContent() {
        let activeTab = [...document.querySelectorAll(".md-typeset .tabbed-block")]
            .find(tab => getComputedStyle(tab).display !== "none");

        // If no tabs exist, return the main content area
        return activeTab || document.querySelector(".md-content") || null;
    }

    function updateSecondaryToc() {
        if (!shouldAddSecondaryToc()) {
            return; // Don't add the TOC if the condition fails
        }

        createTocContainer();
        const tocContainer = document.querySelector(".floating-toc");
        const tocList = tocContainer.querySelector("ul");
        tocList.innerHTML = ""; // Clear old entries

        const activeTab = getActiveTabContent();
        if (!activeTab) {
            console.warn("⚠ No active tab found!");
            return;
        }

        const headers = activeTab.querySelectorAll("h2, h3"); // Get headers from active tab only
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
    if (shouldAddSecondaryToc()) {
        createTocContainer();
        updateSecondaryToc();
    }

    // Update ToC when tabs switch
    document.addEventListener("click", function (event) {
        if (event.target.closest(".md-tabs__link, .md-typeset .tabbed-labels")) {
            setTimeout(updateSecondaryToc, 100); // Wait for tab switch
        }
    });
});
