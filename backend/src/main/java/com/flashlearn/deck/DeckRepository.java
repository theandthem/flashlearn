package com.flashlearn.deck;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeckRepository extends JpaRepository<Deck, UUID> {
}
