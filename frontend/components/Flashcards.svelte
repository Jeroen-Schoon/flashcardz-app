<script>
    import Modal from "./Modal.svelte"; // Import your Modal component
    import Flashcard from "./Flashcard.svelte"; // A component to display individual flashcards, you'll create this next.

    export let category;
    export let userId;
    export let showFlashcards;

    let flashcards = [];
    let showModal = false;
    let newFlashcard = { question: '', answer: '' };

    function goToCategories() {
        showFlashcards = false;
    }

    // Trigger category fetching when logged_in changes
    $: if (category) {
        fetchFlashcards();
    }

    // Fetch flashcards for the specified category
    async function fetchFlashcards() {
        try {
            const response = await fetch(`/user/${userId}/categories/${category.id}/flashcards`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to fetch flashcards');
            }

            const data = await response.json();
            flashcards = data.flashcards; // Assuming the API returns { flashcards: [...] }

        } catch (error) {
            console.error('Error fetching flashcards:', error.message);
        }
    }

    // Open the modal for adding a new flashcard
    function openAddFlashcardModal() {
        showModal = true;
    }

    // Add a new flashcard to the database
    async function addFlashcard(formData) {
        try {
            const response = await fetch(`/user/${userId}/categories/${category.id}/flashcards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: formData["Question"], answer: formData["Answer"] }),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to add flashcard');
            }

            // Refresh list of flashcards
            fetchFlashcards();
            showModal = false; // Close modal
            newFlashcard = { question: '', answer: '' }; // Reset form fields

        } catch (error) {
            console.error('Error adding flashcard:', error.message);
        }
    }
</script>

<h1>{category.name} Flashcards</h1>
<div class="categories centered">
    {#each flashcards as flashcard}
        <Flashcard bind:flashcard={flashcard} refreshFlashcards={fetchFlashcards}/>
    {/each}
    <button class="category" on:click="{openAddFlashcardModal}">
        <h3 class="large">+</h3>
    </button>
</div>
<button class="go-back-button" on:click={goToCategories}>Go back</button>

<!-- Modal for adding new flashcards -->
<Modal
    bind:showModal={showModal}
    title="Add New Flashcard"
    fields={['Question', 'Answer']}
    submitButtonLabel="Add Flashcard"
    onSubmit={addFlashcard}
/>