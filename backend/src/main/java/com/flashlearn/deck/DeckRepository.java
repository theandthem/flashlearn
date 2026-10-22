package com.flashlearn.deck;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeckRepository extends JpaRepository<Deck, UUID> {

    // Newest decks first, for the library view.
    List<Deck> findAllByOrderByCreatedAtDesc();
}
