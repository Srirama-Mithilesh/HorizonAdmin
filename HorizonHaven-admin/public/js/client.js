
function switchView(viewName) {
    // Hide all sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(section => {
        section.classList.remove('active');
        // Small delay to reset split layout display logic if needed
        setTimeout(() => {
            if (!section.classList.contains('active')) {
                // optional cleanup
            }
        }, 300);
    });

    // Determine ID based on view name
    let sectionId = '';
    if (viewName === 'landing') sectionId = 'landing-section';
    else if (viewName === 'casual') sectionId = 'casual-section';
    else if (viewName === 'professional') sectionId = 'professional-section';
    else if (viewName === 'success') sectionId = 'success-section';

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

async function handleSubmit(event, type) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    // UI Loading state
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";

    // Gather data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/submit-listing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();

        if (result.success) {
            // Update success message based on type
            const messageEl = document.getElementById('success-message');
            if (type === 'professional') {
                messageEl.innerText = "Thank you for partnering with Horizon. Our onboarding team will review your verification documents and contact you within 24 hours.";
            } else {
                messageEl.innerText = "Your listing is being prepared! We'll notify you once it's live for travelers around the world.";
            }
            
            switchView('success');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

// Initial state check (optional)
document.addEventListener('DOMContentLoaded', () => {
    // Ensure landing is active on load
    document.getElementById('landing-section').classList.add('active');
});
