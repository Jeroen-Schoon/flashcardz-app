<script>
    import Modal from "./Modal.svelte";
    export let flashcard;
    export let showAnswer = false;
    export let refreshFlashcards;
    let showModal = false;

    // Function to open the modal for adding a new flashcard
    function openEditFlashcardModal(event) {
        event.stopPropagation(); // Prevent event from activating the parent button
        showModal = true;
    }

    // Hide or show answer
    function flipAnswer(event) {
        event.preventDefault();
        showAnswer = !showAnswer;
    }

    // Edit the flashcard
    async function editFlashcard(formData) {
        try {
            const response = await fetch(`/flashcard/${flashcard.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: formData["Question"],
                    answer: formData["Answer"]
                }),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to edit flashcard');
            }

            // Close modal
            showModal = false;

            // Update the local flashcard object with the new data
            flashcard.question = formData["Question"];
            flashcard.answer = formData["Answer"];
        } catch (error) {
            console.error('Error editing flashcard:', error.message);
        }
    }

    // Delete the flashcard from the database
    async function deleteFlashcard(event) {
        event.stopPropagation(); // Prevent event from activating the parent button

        const confirmation = confirm('Are you sure you want to delete this flashcard?');
        if (!confirmation) return;

        try {
            const response = await fetch(`/flashcard/${flashcard.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to delete flashcard');
            }

            refreshFlashcards();
        } catch (error) {
            console.error('Error deleting flashcard:', error.message);
        }
    }
</script>

<button class="category" on:click={flipAnswer}>
    <h4>{flashcard.question}</h4>
    {#if !showAnswer}
        <button class="edit-button" on:click={openEditFlashcardModal}>Edit</button>
        <button class="delete-button" on:click={deleteFlashcard}>Delete</button>
    {:else}
        <p>{flashcard.answer}</p>
    {/if}
</button>

<!-- Modal for editing flashcards -->
<Modal
    bind:showModal={showModal}
    title="Edit Flashcard"
    fields={['Question', 'Answer']}
    submitButtonLabel="Save Changes"
    onSubmit={editFlashcard}
    initialValues={{ "Question": flashcard.question, "Answer": flashcard.answer }}
/>