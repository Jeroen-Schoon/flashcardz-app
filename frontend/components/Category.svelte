<script>
    export let category;
    export let showFlashcards;
    export let selectedCategory;
    export let userId;
    export let refreshCategories;

    // Open the flashcards page
    function openFlashcards(event) {
        event.preventDefault();
        selectedCategory = category;
        showFlashcards = true;
    }

    // Deletes a category from the database
    async function deleteCategory(event) {
        event.stopPropagation(); // Prevent event from activating the parent button

        const confirmation = confirm('Are you sure you want to delete this category?');
        if (!confirmation) return;

        try {
            const response = await fetch(`/user/${userId}/categories/${category.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to delete flashcard');
            }

            if (refreshCategories) {
                refreshCategories(userId);
            }
        } catch (error) {
            console.error('Error deleting flashcard:', error.message);
        }
    }

</script>

<button class="category" on:click={openFlashcards}>
    <button class="delete-button" on:click="{deleteCategory}">Delete</button>
    <h3>{category.name}</h3>
</button>
