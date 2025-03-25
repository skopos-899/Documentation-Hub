let formHasData = false;
let documents = [];
const scriptURL = "https://script.google.com/macros/s/AKfycbw6DVG7jk7Py6nlGMVH5UX251rM4ZD7MHeKQ2-rbcY19A3_hkuGAtYREZaxsb3qqxs/exec";
let activeCategory = "all";
let searchQuery = "";

// Load documents when page loads
document.addEventListener("DOMContentLoaded", function() {
    // Set up form input listeners
    const formInputs = document.querySelectorAll(".form-popup input, .form-popup textarea, .form-popup select");
    formInputs.forEach(input => {
        input.addEventListener("focus", function() {
            this.classList.remove("highlight");
        });
    });
    
    // Set up search input
    document.getElementById("searchInput").addEventListener("input", function() {
        searchQuery = this.value.toLowerCase().trim();
        filterDocuments();
    });
    
    // Set up category filter buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            activeCategory = this.getAttribute('data-category');
            filterDocuments();
        });
    });
    
    // Initial load of documents
    loadDocuments();
});

function showForm() {
    document.getElementById("formOverlay").style.display = "flex";
}

function closeForm() {
    if (formHasData && !confirm("You have unsaved changes. Close anyway?")) {
        return;
    }
    document.getElementById("formOverlay").style.display = "none";
    resetForm();
}

function trackChanges() {
    const inputs = document.querySelectorAll(".form-popup input, .form-popup textarea, .form-popup select");
    formHasData = Array.from(inputs).some(input => input.value.trim() !== "");
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

async function checkDuplicateUrl(url) {
    try {
        const response = await fetch(`${scriptURL}?action=checkUrl&url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // If there's an error, log it but allow submission
        if (data.result === "error") {
            console.error("Server error checking URL:", data.error);
            return false;
        }
        
        return data.result === "duplicate";
    } catch (error) {
        console.error("Error checking duplicate URL:", error);
        return false; // Allow submission on error
    }
}

async function loadDocuments() {
    try {
        // Show loading indicator
        document.getElementById("dataLoading").style.display = "block";
        
        console.log("Fetching documents from server...");
        // Fetch approved documents from the server
        const response = await fetch(`${scriptURL}?action=getApproved`, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received data from server:", data);
        
        if (data.result === "success") {
            documents = data.documents || [];
            console.log("Processed documents:", documents);
            
            if (documents.length === 0) {
                console.log("No documents found");
                document.getElementById("documentGrid").innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <div class="empty-state-title">No Documents Available</div>
                        <div class="empty-state-text">
                            Be the first to add a document to our collection!
                        </div>
                        <button class="empty-state-button" onclick="showForm()">Add Document</button>
                    </div>
                `;
            } else {
                console.log(`Found ${documents.length} documents, filtering...`);
                filterDocuments();
            }
        } else {
            console.error("Server returned error:", data.error);
            throw new Error(data.error || "Failed to load documents");
        }
    } catch (error) {
        console.error("Error loading documents:", error);
        document.getElementById("documentGrid").innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-title">Error Loading Documents</div>
                <div class="empty-state-text">
                    There was an error loading the documents. Please try again later.
                    <br>Error: ${error.message}
                </div>
                <button class="empty-state-button" onclick="loadDocuments()">Retry</button>
            </div>
        `;
    } finally {
        document.getElementById("dataLoading").style.display = "none";
    }
}

function filterDocuments() {
    const grid = document.getElementById("documentGrid");
    
    console.log("Filtering documents with:", {
        activeCategory,
        searchQuery,
        totalDocuments: documents.length
    });
    
    // Filter documents by category and search query
    const filteredDocs = documents.filter(doc => {
        // Category filter
        const categoryMatch = activeCategory === "all" || doc.docCategory === activeCategory;
        
        // Search filter
        const searchMatch = searchQuery === "" || 
            doc.docTitle.toLowerCase().includes(searchQuery) || 
            doc.docDescription.toLowerCase().includes(searchQuery) || 
            doc.docPublisher.toLowerCase().includes(searchQuery);
        
        return categoryMatch && searchMatch;
    });
    
    console.log(`Found ${filteredDocs.length} filtered documents`);
    
    // Clear current grid
    grid.innerHTML = "";
    
    // If no documents found
    if (filteredDocs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No Documents Found</div>
                <div class="empty-state-text">
                    ${searchQuery ? `No documents match "${searchQuery}"` : ''}
                    ${searchQuery && activeCategory !== "all" ? ' in ' : ''}
                    ${activeCategory !== "all" ? `the "${activeCategory}" category.` : ''}
                    ${(searchQuery || activeCategory !== "all") ? '<br>Try adjusting your search criteria.' : ''}
                </div>
                <button class="empty-state-button" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }
    
    // Add documents to grid
    filteredDocs.forEach(doc => {
        const date = new Date(doc.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        const card = document.createElement("div");
        card.className = "document-card";
        card.onclick = function() {
            window.open(doc.docLink, '_blank');
        };
        
        // Create elements safely instead of using innerHTML directly
        const categoryBadge = document.createElement("div");
        categoryBadge.className = "category-badge";
        categoryBadge.textContent = doc.docCategory;
        
        const cardContent = document.createElement("div");
        cardContent.className = "card-content";
        
        const cardTitle = document.createElement("div");
        cardTitle.className = "card-title";
        cardTitle.textContent = doc.docTitle;
        
        const cardDescription = document.createElement("div");
        cardDescription.className = "card-description";
        cardDescription.textContent = doc.docDescription;
        
        const cardFooter = document.createElement("div");
        cardFooter.className = "card-footer";
        
        const cardPublisher = document.createElement("div");
        cardPublisher.className = "card-publisher";
        cardPublisher.textContent = "By: " + doc.docPublisher;
        
        const cardDate = document.createElement("div");
        cardDate.className = "card-date";
        cardDate.textContent = formattedDate;
        
        // Preview section
        const cardPreview = document.createElement("div");
        cardPreview.className = "card-preview";
        
        const previewContent = document.createElement("div");
        
        const previewTitle = document.createElement("div");
        previewTitle.className = "preview-title";
        previewTitle.textContent = doc.docTitle;
        
        const previewDescription = document.createElement("div");
        previewDescription.className = "preview-description";
        previewDescription.textContent = doc.docDescription;
        
        const previewLink = document.createElement("div");
        previewLink.className = "preview-link";
        previewLink.textContent = "Click to visit →";
        
        // Assemble all the elements
        cardFooter.appendChild(cardPublisher);
        cardFooter.appendChild(cardDate);
        
        cardContent.appendChild(cardTitle);
        cardContent.appendChild(cardDescription);
        cardContent.appendChild(cardFooter);
        
        previewContent.appendChild(previewTitle);
        previewContent.appendChild(previewDescription);
        
        cardPreview.appendChild(previewContent);
        cardPreview.appendChild(previewLink);
        
        card.appendChild(categoryBadge);
        card.appendChild(cardContent);
        card.appendChild(cardPreview);
        
        grid.appendChild(card);
    });
}

function resetFilters() {
    // Reset search
    document.getElementById("searchInput").value = "";
    searchQuery = "";
    
    // Reset category
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === 'all') {
            btn.classList.add('active');
        }
    });
    activeCategory = "all";
    
    // Refresh documents
    filterDocuments();
}

// Sanitize input to prevent XSS attacks
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

async function submitDocument() {
    // Hide any previous error messages
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "none";
    
    // Reset all highlight borders
    document.querySelectorAll(".highlight").forEach(el => {
        el.classList.remove("highlight");
    });
    
    // Honeypot check - if the invisible field is filled, it's likely a bot
    if (document.getElementById("website").value !== "") {
        console.log("Bot submission detected");
        // Pretend submission was successful but don't actually submit
        setTimeout(() => {
            alert("📄 Your document has been added successfully! Wait till the admin approve it.");
            closeForm();
        }, 1500);
        return;
    }

    // Required fields validation
    const requiredFields = ["docTitle", "docDescription", "docLink", "docCategory", "docPublisher"];
    let isValid = true;

    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        if (!input.value.trim()) {
            input.classList.add("highlight");
            isValid = false;
        }
    });

    if (!isValid) {
        errorMessage.innerHTML = "Please fill in all required fields.";
        errorMessage.style.display = "block";
        return;
    }

    // URL validation
    const docLink = document.getElementById("docLink").value;
    if (!validateUrl(docLink)) {
        document.getElementById("docLink").classList.add("highlight");
        errorMessage.innerHTML = "Please enter a valid URL.";
        errorMessage.style.display = "block";
        return;
    }

    // Description length validation
    const docDescription = document.getElementById("docDescription").value;
    if (docDescription.length > 250) {
        document.getElementById("docDescription").classList.add("highlight");
        errorMessage.innerHTML = "Description must be under 250 characters.";
        errorMessage.style.display = "block";
        return;
    }

    // Email validation (if provided)
    const docEmail = document.getElementById("docEmail").value;
    if (docEmail && !validateEmail(docEmail)) {
        document.getElementById("docEmail").classList.add("highlight");
        errorMessage.innerHTML = "Please enter a valid email address.";
        errorMessage.style.display = "block";
        return;
    }

    // Show loading indicator
    document.getElementById("loading").style.display = "block";
    
    // Check for duplicate URL
    try {
        const isDuplicate = await checkDuplicateUrl(docLink);
        if (isDuplicate) {
            document.getElementById("docLink").classList.add("highlight");
            errorMessage.innerHTML = "This URL already exists in our documentation.";
            errorMessage.style.display = "block";
            document.getElementById("loading").style.display = "none";
            return;
        }
    
        // If all validations pass, prepare form data
        const docTitle = sanitizeInput(document.getElementById("docTitle").value);
        const docCategory = sanitizeInput(document.getElementById("docCategory").value);
        const docPublisher = sanitizeInput(document.getElementById("docPublisher").value);
        const sanitizedDescription = sanitizeInput(docDescription);
        const sanitizedEmail = sanitizeInput(docEmail || "");

        const formData = new FormData();
        formData.append("docTitle", docTitle);
        formData.append("docDescription", sanitizedDescription);
        formData.append("docLink", docLink); // URLs don't need sanitization in the same way
        formData.append("docCategory", docCategory);
        formData.append("docPublisher", docPublisher);
        formData.append("docEmail", sanitizedEmail); // Handle empty email

        // Submit the form
        const response = await fetch(scriptURL, {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result === "success") {
            alert("📄 Your document has been added successfully! Wait till the admin approve it.");
            closeForm();
            
            // Refresh documents list
            loadDocuments();
        } else {
            throw new Error(data.error || "Unknown error occurred");
        }
    } catch (error) {
        console.error("Submission error:", error);
        errorMessage.innerHTML = `Error: ${error.message}. Please try again.`;
        errorMessage.style.display = "block";
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

function resetForm() {
    document.querySelectorAll(".form-popup input, .form-popup textarea, .form-popup select").forEach(input => {
        input.value = "";
        input.classList.remove("highlight");
    });
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("loading").style.display = "none";
    formHasData = false;
}
